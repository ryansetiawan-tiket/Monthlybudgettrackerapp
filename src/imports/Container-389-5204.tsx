import svgPaths from "./svg-hc0wc1wzgg";

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M12.5 15L7.5 10L12.5 5" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[44px] relative rounded-[1.67772e+07px] shrink-0 w-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[44px] items-center justify-center relative w-[36px]">
        <Icon />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="basis-0 grow h-[28px] min-h-px min-w-px relative shrink-0" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[28px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[20px] text-neutral-50 text-nowrap top-0 tracking-[-0.4492px] whitespace-pre">Info Kantong</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[12px] h-[44px] items-center relative shrink-0 w-full" data-name="Container">
      <Button />
      <Heading />
    </div>
  );
}

function PocketDetailPage() {
  return (
    <div className="bg-neutral-950 h-[85px] relative shrink-0 w-[393px]" data-name="PocketDetailPage">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-800 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[85px] items-start pb-px pt-[24px] px-[16px] relative w-[393px]">
        <Container />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[rgba(139,92,246,0.1)] relative rounded-[14px] shrink-0 size-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(139,92,246,0.25)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center p-px relative size-[48px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[28px] not-italic relative shrink-0 text-[20px] text-neutral-50 text-nowrap tracking-[-0.4492px] whitespace-pre">❄️</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[28px] left-0 top-0 w-[301px]" data-name="Heading 2">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-neutral-50 text-nowrap top-0 tracking-[-0.4395px] whitespace-pre">Uang Dingin</p>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-neutral-800 h-[22px] left-0 rounded-[8px] top-[32px] w-[107.242px]" data-name="Badge">
      <div className="h-[22px] overflow-clip relative rounded-[inherit] w-[107.242px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[9px] not-italic text-[12px] text-neutral-50 text-nowrap top-[4px] whitespace-pre">Kantong Utama</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container2() {
  return (
    <div className="basis-0 grow h-[54px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[54px] relative w-full">
        <Heading1 />
        <Badge />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[12px] h-[54px] items-center relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function PrimitiveDiv() {
  return <div className="bg-neutral-800 h-px shrink-0 w-full" data-name="Primitive.div" />;
}

function Container4() {
  return (
    <div className="bg-[rgba(240,177,0,0.1)] relative rounded-[10px] shrink-0 size-[28px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[28px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-neutral-50 text-nowrap tracking-[-0.3125px] whitespace-pre">✨</p>
      </div>
    </div>
  );
}

function PrimitiveLabel() {
  return (
    <div className="basis-0 grow h-[14px] min-h-px min-w-px relative shrink-0" data-name="Primitive.label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[14px] items-center relative w-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">Mode Real-time</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[28px] relative shrink-0 w-[140.328px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[28px] items-center relative w-[140.328px]">
        <Container4 />
        <PrimitiveLabel />
      </div>
    </div>
  );
}

function PrimitiveSpan() {
  return (
    <div className="bg-neutral-950 relative rounded-[1.67772e+07px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0 size-[16px]" data-name="Primitive.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[16px]" />
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="bg-neutral-50 h-[20px] relative rounded-[1.67772e+07px] shrink-0 w-[36px]" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-center pl-[17px] pr-px py-px relative w-[36px]">
        <PrimitiveSpan />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[rgba(38,38,38,0.5)] h-[52px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[52px] items-center justify-between px-[12px] py-0 relative w-full">
          <Container5 />
          <PrimitiveButton />
        </div>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[20px] left-0 top-[14px] w-[85.109px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Saldo Hari Ini</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute content-stretch flex h-[36px] items-start left-[165.59px] top-0 w-[195.414px]" data-name="Paragraph">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[36px] not-italic relative shrink-0 text-[#05df72] text-[30px] text-nowrap tracking-[0.3955px] whitespace-pre">Rp 13.026.647</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Paragraph />
      <Paragraph1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[361.43px] not-italic text-[#a1a1a1] text-[12px] text-right top-px translate-x-[-100%] w-[117px]">Sampai 13 Nov 2025</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[60px] items-start relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Paragraph2 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Breakdown</p>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20px] relative shrink-0 w-[63.117px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[63.117px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Saldo Asli</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[90.758px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[90.758px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-neutral-50 text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">-Rp 1.208.702</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[44px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[44px] items-center justify-between px-[12px] py-0 relative w-full">
          <Text />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-0 size-[16px] top-[2px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p2f7f3780} id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pa1bcac0} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[20px] relative shrink-0 w-[121.617px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[121.617px]">
        <Icon1 />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[24px] not-italic text-[#ff6467] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Transfer Keluar</p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[20px] relative shrink-0 w-[80.219px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[80.219px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#ff6467] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[81px]">-Rp 853.261</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[44px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[44px] items-center justify-between px-[12px] py-0 relative w-full">
          <Text2 />
          <Text3 />
        </div>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[20px] relative shrink-0 w-[80.391px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[80.391px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Pengeluaran</p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[90.102px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[90.102px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-neutral-50 top-[0.5px] tracking-[-0.1504px] w-[91px]">-Rp 4.316.158</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[44px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[44px] items-center justify-between px-[12px] py-0 relative w-full">
          <Text4 />
          <Text5 />
        </div>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[148px] items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[180px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Container12 />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[rgba(246,51,154,0.1)] relative rounded-[10px] shrink-0 size-[28px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[28px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-neutral-50 text-nowrap tracking-[-0.3125px] whitespace-pre">💖</p>
      </div>
    </div>
  );
}

function PrimitiveLabel1() {
  return (
    <div className="basis-0 grow h-[14px] min-h-px min-w-px relative shrink-0" data-name="Primitive.label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[14px] items-center relative w-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">Simulasi Wishlist</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[28px] relative shrink-0 w-[147.195px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[28px] items-center relative w-[147.195px]">
        <Container14 />
        <PrimitiveLabel1 />
      </div>
    </div>
  );
}

function PrimitiveSpan1() {
  return (
    <div className="bg-neutral-950 relative rounded-[1.67772e+07px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0 size-[16px]" data-name="Primitive.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[16px]" />
    </div>
  );
}

function PrimitiveButton1() {
  return (
    <div className="bg-neutral-50 h-[20px] relative rounded-[1.67772e+07px] shrink-0 w-[36px]" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-center pl-[17px] pr-px py-px relative w-[36px]">
        <PrimitiveSpan1 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="bg-[rgba(38,38,38,0.5)] h-[52px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[52px] items-center justify-between px-[12px] py-0 relative w-full">
          <Container15 />
          <PrimitiveButton1 />
        </div>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Deskripsi</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] h-[44px] relative rounded-[10px] shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[14px] text-neutral-50 text-nowrap top-[12.5px] tracking-[-0.1504px] whitespace-pre">Dana untuk hobi dan hiburan</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[72px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Paragraph3 />
    </div>
  );
}

function PocketDetailPage1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[393px]" data-name="PocketDetailPage">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[24px] h-full items-start overflow-clip pb-0 pt-[16px] px-[16px] relative rounded-[inherit] w-[393px]">
        <Container3 />
        <PrimitiveDiv />
        <Container6 />
        <Container8 />
        <PrimitiveDiv />
        <Container13 />
        <PrimitiveDiv />
        <Container16 />
        <PrimitiveDiv />
        <Container17 />
        <PrimitiveDiv />
      </div>
    </div>
  );
}

export default function Container18() {
  return (
    <div className="bg-neutral-950 content-stretch flex flex-col items-start relative size-full" data-name="Container">
      <PocketDetailPage />
      <PocketDetailPage1 />
    </div>
  );
}