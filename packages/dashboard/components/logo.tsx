'use client';

import Image from 'next/image';

export function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <>
      <Image
        src="/logo-light.png"
        alt="Reivo"
        width={400}
        height={100}
        className={`${className} w-auto dark:hidden`}
        priority
      />
      <Image
        src="/logo-dark.png"
        alt="Reivo"
        width={400}
        height={100}
        className={`${className} hidden w-auto dark:block`}
        priority
      />
    </>
  );
}
