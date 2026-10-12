// An amount box for money saved in rupees, shown and typed in the visitor's
// selected currency (symbol inside the box, digits grouped: ₹1,00,000 or
// $1,000). A drop-in for <Input>: `value` is the rupee amount the form keeps,
// and `onChange` receives `{ target: { value } }` with the new rupee amount, so
// `onChange={(e) => setField("cost", e.target.value)}` keeps working unchanged.
//
// What the user typed is kept as typed; it is only converted to rupees for the
// form. An amount the user doesn't touch is never re-converted, so switching
// currencies and saving can't drift the stored rupee value.
import { forwardRef, useEffect, useRef, useState } from 'react';
import AmountInput, { type AmountInputProps } from '@/components/ui/amount-input';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface MoneyInputProps extends Omit<AmountInputProps, 'value' | 'onChange' | 'symbol' | 'indian'> {
  /** The rupee amount (string or number, '' for empty). */
  value: string | number | null | undefined;
  onChange: (e: { target: { value: string } }) => void;
}

const toText = (n: number) => (Number.isFinite(n) ? String(Math.round(n * 100) / 100) : '');

const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { value, onChange, placeholder, ...rest },
  ref,
) {
  const { currency, symbol, inrToDisplay, displayToInr } = useCurrency();
  const inr = value == null ? '' : String(value);
  const shown = (v: string) => (v.trim() === '' || !Number.isFinite(Number(v)) ? v : toText(inrToDisplay(Number(v))));

  const [text, setText] = useState(() => shown(inr));
  // The rupee value and currency `text` was last made from.
  const source = useRef({ inr, currency });

  useEffect(() => {
    if (source.current.inr !== inr || source.current.currency !== currency) {
      source.current = { inr, currency };
      setText(shown(inr));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inr, currency]);

  const rupees = currency === 'INR';
  return (
    <AmountInput
      ref={ref}
      {...rest}
      symbol={symbol}
      indian={rupees}
      placeholder={placeholder && !rupees && Number.isFinite(Number(placeholder)) ? toText(inrToDisplay(Number(placeholder))) : placeholder}
      value={text}
      onChange={(e) => {
        const typed = e.target.value;
        setText(typed);
        const n = Number(typed);
        const next = typed.trim() === '' || !Number.isFinite(n) ? typed : rupees ? typed : toText(displayToInr(n));
        source.current = { inr: next, currency };
        onChange({ target: { value: next } });
      }}
    />
  );
});

export default MoneyInput;
