'use client';

import React, { useId } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';

export interface InputOtp9Props {
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  hasError?: boolean;
}

const InputOtp9: React.FC<InputOtp9Props> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  label = 'Enter 6 digit OTP',
  hasError = false,
}) => {
  const id = useId();

  return (
    <div className="w-full flex flex-col items-center space-y-3 py-1">
      {label && (
        <Label htmlFor={id} className="text-xs tracking-wider uppercase font-semibold text-neutral-300">
          {label}
        </Label>
      )}

      <InputOTP
        id={id}
        maxLength={6}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        disabled={disabled}
        autoFocus={autoFocus}
        containerClassName="flex items-center justify-center w-full"
      >
        <div className="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-3">
          <InputOTPGroup className="flex gap-1 xs:gap-1.5 sm:gap-2">
            {[0, 1, 2].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={`!h-10 xs:!h-11 sm:!h-13 !w-8 xs:!w-9.5 sm:!w-12 !rounded-lg sm:!rounded-xl !border-2 !text-base xs:!text-lg sm:!text-xl !font-bold transition-all duration-200 !bg-[#131622] !text-white shadow-[inset_0px_2px_4px_rgba(0,0,0,0.6)] ${
                  hasError
                    ? '!border-red-500/90 !ring-2 !ring-red-500/40 !text-red-400'
                    : '!border-white/20 hover:!border-[#ffbe33]/80 data-[active=true]:!border-[#ffbe33] data-[active=true]:!ring-4 data-[active=true]:!ring-[#ffbe33]/25 data-[active=true]:!bg-[#1a1f30]'
                }`}
              />
            ))}
          </InputOTPGroup>

          <InputOTPSeparator className="text-[#ffbe33] font-bold text-sm xs:text-base sm:text-xl px-0 xs:px-0.5">
            —
          </InputOTPSeparator>

          <InputOTPGroup className="flex gap-1 xs:gap-1.5 sm:gap-2">
            {[3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={`!h-10 xs:!h-11 sm:!h-13 !w-8 xs:!w-9.5 sm:!w-12 !rounded-lg sm:!rounded-xl !border-2 !text-base xs:!text-lg sm:!text-xl !font-bold transition-all duration-200 !bg-[#131622] !text-white shadow-[inset_0px_2px_4px_rgba(0,0,0,0.6)] ${
                  hasError
                    ? '!border-red-500/90 !ring-2 !ring-red-500/40 !text-red-400'
                    : '!border-white/20 hover:!border-[#ffbe33]/80 data-[active=true]:!border-[#ffbe33] data-[active=true]:!ring-4 data-[active=true]:!ring-[#ffbe33]/25 data-[active=true]:!bg-[#1a1f30]'
                }`}
              />
            ))}
          </InputOTPGroup>
        </div>
      </InputOTP>
    </div>
  );
};

export default InputOtp9;
