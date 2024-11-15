'use client';

import LanguageSwitch from '@/components/language-switch';
import useGlobalStore from '@/config/use-global';
import { LoginIcon } from '@repo/ui/lotties';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import Link from 'next/link';

import ThemeSwitch from '@/components/theme-switch';
import UserAuthForm from './user-auth-form';

export default function Page() {
  const t = useTranslations('auth');
  const { common } = useGlobalStore();
  const { site } = common;

  return (
    <main className='bg-muted/50 flex h-full min-h-screen items-center'>
      <div className='flex size-full flex-auto flex-col justify-center lg:flex-row'>
        <div className='flex lg:w-1/2 lg:flex-auto'>
          <div className='flex w-full flex-col items-center justify-center px-5 py-4 md:px-14 lg:py-14'>
            <Link className='mb-0 flex flex-col items-center lg:mb-12' href='/'>
              <Image src={site.site_logo || '/favicon.svg'} height={48} width={48} alt='logo' />
              <span className='text-2xl font-semibold'>{site.site_name}</span>
            </Link>
            <LoginIcon className='mx-auto hidden w-[275px] md:w-1/2 lg:block xl:w-[500px]' />
            <p className='hidden w-[275px] text-center md:w-1/2 lg:block xl:w-[500px]'>
              {site.site_desc}
            </p>
          </div>
        </div>
        <div className='flex flex-initial justify-center p-8 lg:flex-auto lg:justify-end'>
          <div className='lg:bg-background flex flex-col items-center rounded-2xl md:w-[600px] lg:flex-auto lg:p-10 lg:shadow'>
            <div className='flex flex-col items-stretch justify-center md:w-[400px] lg:h-full'>
              <div className='flex flex-col justify-center pb-14 lg:flex-auto lg:pb-20'>
                <UserAuthForm />
              </div>
              <div className='flex items-center justify-end'>
                {/* <div className='text-primary flex gap-5 text-sm font-semibold'>
                  <Link href='/tos'>{t('tos')}</Link>
                </div> */}
                <div className='flex items-center gap-5'>
                  <LanguageSwitch />
                  <ThemeSwitch />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}