'use client';

import { Display } from '@/components/display';
import { Separator } from '@workspace/ui/components/separator';
import { useTranslations } from 'next-intl';

export function SubscribeBilling({
  order,
}: {
  order?: Partial<
    API.OrderDetail & {
      unit_price: number;
      unit_time: number;
      subscribe_discount: number;
    }
  >;
}) {
  const t = useTranslations('subscribe');

  return (
    <>
      <div className='font-semibold'>{t('billing.billingTitle')}</div>
      <ul className='grid grid-cols-2 gap-3 *:flex *:items-center *:justify-between lg:grid-cols-1'>
        {order?.type && [1, 2].includes(order?.type) && (
          <li>
            <span className='text-muted-foreground'>{t('billing.duration')}</span>
            <span>
              {order?.quantity || 1} {t(order?.unit_time || 'Month')}
            </span>
          </li>
        )}
        <li>
          <span className='text-muted-foreground'>{t('billing.price')}</span>
          <span>
            <Display type='currency' value={order?.price || order?.unit_price} />
          </span>
        </li>
        <li>
          <span className='text-muted-foreground'>{t('billing.productDiscount')}</span>
          <span>
            <Display type='currency' value={order?.discount} />
          </span>
        </li>
        <li>
          <span className='text-muted-foreground'>{t('billing.couponDiscount')}</span>
          <span>
            <Display type='currency' value={order?.coupon_discount} />
          </span>
        </li>
        {order?.subscribe_discount && (
          <li>
            <span className='text-muted-foreground'>{t('subscriptionDiscount')}</span>
            <span>
              <Display type='currency' value={order?.subscribe_discount} />
            </span>
          </li>
        )}
        <li>
          <span className='text-muted-foreground'>{t('billing.fee')}</span>
          <span>
            <Display type='currency' value={order?.fee_amount} />
          </span>
        </li>
      </ul>
      <Separator />
      <div className='flex items-center justify-between font-semibold'>
        <span className='text-muted-foreground'>{t('billing.total')}</span>
        <span>
          <Display type='currency' value={order?.amount} />
        </span>
      </div>
    </>
  );
}