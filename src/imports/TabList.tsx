function PrimitiveButton() {
  return (
    <div className="absolute bg-[rgba(255,76,76,0.1)] box-border content-stretch flex gap-[6px] h-[29.005px] items-center justify-center left-[2.99px] px-[8.502px] py-[4.502px] rounded-[8px] top-[3.5px] w-[170.104px]" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[#ff4c4c] border-[0.502px] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">Pengeluaran</p>
    </div>
  );
}

function PrimitiveButton1() {
  return (
    <div className="absolute box-border content-stretch flex gap-[6px] h-[29.005px] items-center justify-center left-[173.1px] px-[8.502px] py-[4.502px] rounded-[14px] top-[3.5px] w-[170.104px]" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[0.502px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#a1a1a1] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre">Pemasukan Tambahan</p>
    </div>
  );
}

export default function TabList() {
  return (
    <div className="bg-neutral-800 relative rounded-[12px] size-full" data-name="Tab List">
      <PrimitiveButton />
      <PrimitiveButton1 />
    </div>
  );
}