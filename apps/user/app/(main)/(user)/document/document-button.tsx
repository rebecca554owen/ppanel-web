'use client';

import { queryDocumentDetail } from '@/services/user/document';
import { Markdown } from '@repo/ui/markdown';
import { Button } from '@shadcn/ui/button';
import { useOutsideClick } from '@shadcn/ui/hooks/use-outside-click';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';

interface Item {
  id: number;
  title: string;
}
export function DocumentButton({ items }: { items: Item[] }) {
  const [active, setActive] = useState<Item | boolean | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    enabled: !!(active as Item)?.id,
    queryKey: ['queryDocumentDetail', (active as Item)?.id],
    queryFn: async () => {
      const { data } = await queryDocumentDetail({
        id: (active as Item)?.id,
      });
      return data.data?.content;
    },
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(false);
      }
    }

    if (active && typeof active === 'object') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === 'object' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-10 h-full w-full bg-black/20'
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === 'object' ? (
          <div className='fixed inset-0 z-[100] grid place-items-center'>
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className='bg-foreground absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full'
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className='bg-muted flex size-full flex-col overflow-auto p-6 sm:rounded'
            >
              <Markdown
                components={{
                  img: ({ node, className, ...props }) => {
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img {...props} width={800} height={600} className='my-4 h-auto' />
                    );
                  },
                }}
              >
                {data || ''}
              </Markdown>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className='flex w-full flex-wrap items-start gap-4'>
        {items.map((item, index) => (
          <motion.div
            layoutId={`card-${item.id}-${id}`}
            key={item.id}
            onClick={() => setActive(item)}
            className='flex cursor-pointer flex-col rounded-xl'
          >
            <Button variant='secondary'>{item.title}</Button>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-4 w-4 text-black'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M18 6l-12 12' />
      <path d='M6 6l12 12' />
    </motion.svg>
  );
};
