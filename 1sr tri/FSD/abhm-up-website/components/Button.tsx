import Link from "next/link";
import { cn } from "./cn";

type ButtonVariant = "primary" | "outline";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
};

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
  variant?: ButtonVariant;
};

type Props = AnchorProps | NativeButtonProps;

export default function Button(props: Readonly<Props>) {
  const variant = props.variant ?? "primary";
  const baseClasses = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition";
  const variantClasses = variant === "primary"
    ? "bg-[var(--abhm-deep-red)] text-white hover:opacity-95"
    : "border border-black/15 bg-white text-black hover:bg-black/5";

  if ("href" in props && typeof props.href === "string") {
    const { href, className, variant: variantProp, ...rest } = props;
    void variantProp;
    return <Link href={href} className={cn(baseClasses, variantClasses, className)} {...rest} />;
  }

  const { className, variant: variantProp, ...rest } = props;
  void variantProp;
  return <button className={cn(baseClasses, variantClasses, className)} {...rest} />;
}
