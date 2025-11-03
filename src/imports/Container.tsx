import svgPaths from "./svg-jeabclbeke";

function Text() {
  return (
    <div className="h-[24px] relative shrink-0 w-[102.102px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[102.102px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Kamis, 30 Okt</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[20px] relative shrink-0 w-[47.297px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] overflow-clip relative rounded-[inherit] w-[47.297px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[48px]">2 items</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M12 10L8 6L4 10" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function ExpenseList() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="ExpenseList">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[24px] items-center relative w-full">
        <Text />
        <Paragraph />
        <Icon />
      </div>
    </div>
  );
}

function ExpenseList1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[93.266px]" data-name="ExpenseList">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[93.266px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#e7000b] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[94px]">-Rp 680.800</p>
      </div>
    </div>
  );
}

function SlotClone() {
  return (
    <div className="bg-[#5a5a5a] h-[48px] relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-full" data-name="SlotClone">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[48px] items-center justify-between px-[12px] py-0 relative w-full">
          <ExpenseList />
          <ExpenseList1 />
        </div>
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[89.289px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[89.289px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Mainan anak2</p>
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-full">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[83px]">-Rp 629.800</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2ab476c0} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p24092800} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon1 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_137_1397)" id="Icon">
          <path d={svgPaths.p804df00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 2.5L9.5 4.5" id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_137_1397">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon2 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d="M5 5.5V8.5" id="Vector" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 5.5V8.5" id="Vector_2" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p16274380} id="Vector_3" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.5 3H10.5" id="Vector_4" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p1c388200} id="Vector_5" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon3 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[24px] relative shrink-0 w-[178.57px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[24px] items-center relative w-[178.57px]">
        <Paragraph2 />
        <Button />
        <Button1 />
        <Button2 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[42px] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_1px_1px_2px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[42px] items-center justify-between pl-[10px] pr-[9px] py-px relative w-full">
          <Paragraph1 />
          <Container />
        </div>
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[20px] relative shrink-0 w-[149.734px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[149.734px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">es teh + macaroni cuck</p>
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-full">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[72px]">-Rp 51.000</p>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p2ab476c0} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p24092800} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon4 />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_137_1397)" id="Icon">
          <path d={svgPaths.p804df00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 2.5L9.5 4.5" id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_137_1397">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon5 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d="M5 5.5V8.5" id="Vector" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 5.5V8.5" id="Vector_2" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p16274380} id="Vector_3" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.5 3H10.5" id="Vector_4" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p1c388200} id="Vector_5" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[24px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[24px]">
        <Icon6 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[24px] relative shrink-0 w-[167.602px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[24px] items-center relative w-[167.602px]">
        <Paragraph4 />
        <Button3 />
        <Button4 />
        <Button5 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[42px] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_1px_1px_2px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[42px] items-center justify-between pl-[10px] pr-[9px] py-px relative w-full">
          <Paragraph3 />
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[113px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-neutral-800 border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] h-[113px] items-start pb-0 pt-[9px] px-[12px] relative w-full">
          <Container1 />
          <Container3 />
        </div>
      </div>
    </div>
  );
}

export default function Container5() {
  return (
    <div className="relative rounded-[10px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[4px] items-start p-px relative size-full">
          <SlotClone />
          <Container4 />
        </div>
      </div>
    </div>
  );
}