'use client';

import CouponInput from '@/components/subscribe/coupon-input';
import DurationSelector from '@/components/subscribe/duration-selector';
import PaymentMethods from '@/components/subscribe/payment-methods';
import SubscribeSelector from '@/components/subscribe/subscribe-selector';
import useGlobalStore from '@/config/use-global';
import { checkoutOrder, preCreateOrder, renewal } from '@/services/user/order';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Separator } from '@workspace/ui/components/separator';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { SubscribeBilling } from './billing';
import { SubscribeDetail } from './detail';

export default function Renewal({ token, subscribe }: { token: string; subscribe: API.Subscribe }) {
  const t = useTranslations('subscribe');
  const { getUserInfo } = useGlobalStore();
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const [params, setParams] = useState<Partial<API.RenewalOrderRequest>>({
    quantity: 1,
    subscribe_id: subscribe.id,
    payment: 'balance',
    coupon: '',
    subscribe_token: token,
  });
  const [loading, startTransition] = useTransition();

  const { data: order } = useQuery({
    enabled: !!subscribe.id && open,
    queryKey: ['preCreateOrder', params],
    queryFn: async () => {
      const { data } = await preCreateOrder({
        ...params,
        subscribe_id: subscribe.id,
      } as API.PurchaseOrderRequest);
      return data.data;
    },
  });

  useEffect(() => {
    if (subscribe.id && token) {
      setParams((prev) => ({
        ...prev,
        quantity: 1,
        subscribe_id: subscribe.id,
        subscribe_token: token,
      }));
    }
  }, [subscribe.id, token]);

  const handleChange = useCallback((field: keyof typeof params, value: string | number) => {
    setParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    startTransition(async () => {
      try {
        const response = await renewal(params as API.RenewalOrderRequest);
        const orderNo = response.data.data?.order_no;
        if (orderNo) {
          const { data } = await checkoutOrder({
            orderNo,
          });
          const type = data.data?.type;
          const checkout_url = data.data?.checkout_url;
          if (type === 'link') {
            const width = 600;
            const height = 800;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            window.open(
              checkout_url,
              'newWindow',
              `width=${width},height=${height},top=${top},left=${left},menubar=0,scrollbars=1,resizable=1,status=1,titlebar=0,toolbar=0,location=1`,
            );
          }
          getUserInfo();
          router.push(`/payment?order_no=${orderNo}`);
        }
      } catch (error) {
        console.log(error);
      }
    });
  }, [params, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>{t('renew')}</Button>
      </DialogTrigger>
      <DialogContent className='flex h-full max-w-screen-lg flex-col overflow-hidden md:h-auto'>
        <DialogHeader>
          <DialogTitle>{t('renewSubscription')}</DialogTitle>
        </DialogHeader>
        <div className='grid w-full gap-3 lg:grid-cols-2'>
          <Card className='border-transparent shadow-none md:border-inherit md:shadow'>
            <CardContent className='grid gap-3 p-0 text-sm md:p-6'>
              <SubscribeDetail
                subscribe={{
                  ...subscribe,
                  quantity: params.quantity,
                }}
              />
              <Separator />
              <SubscribeBilling
                order={{
                  ...order,
                  quantity: params.quantity,
                  unit_price: subscribe?.unit_price,
                }}
              />
            </CardContent>
          </Card>
          <div className='flex flex-col justify-between text-sm'>
            <div className='grid gap-3'>
              <DurationSelector
                quantity={params.quantity!}
                unitTime={subscribe?.unit_time}
                discounts={subscribe?.discount}
                onChange={(value) => {
                  handleChange('quantity', value);
                }}
              />
              <CouponInput
                coupon={params.coupon}
                onChange={(value) => handleChange('coupon', value)}
              />
              <SubscribeSelector
                value={params.discount_subscribe_id}
                data={order?.discount_list || []}
                onChange={(value) => {
                  handleChange('discount_subscribe_id', value);
                }}
              />
              <PaymentMethods
                value={params.payment!}
                onChange={(value) => {
                  handleChange('payment', value);
                }}
              />
            </div>
            <Button
              className='fixed bottom-0 left-0 w-full rounded-none md:relative md:mt-6'
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading && <LoaderCircle className='mr-2 animate-spin' />}
              {t('buyNow')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}