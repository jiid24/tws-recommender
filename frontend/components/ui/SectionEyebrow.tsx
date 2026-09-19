type SectionEyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionEyebrow({ children, className = "" }: SectionEyebrowProps) {
  return (
    <p className={`ui-eyebrow ${className}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet-500" />
      {children}
    </p>
  );
}
