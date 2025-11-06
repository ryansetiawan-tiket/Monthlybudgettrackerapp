function Text() {
  return (
    <div className="h-[24.005px] relative shrink-0 w-[92.196px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Health Saldo</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center justify-center relative shrink-0" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#e7000b] text-[16px] tracking-[-0.3125px] w-[29px]">11%</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] items-center relative">
        <Text />
        <Text1 />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] items-center justify-center relative">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#a1a1a1] text-[14px] text-center text-nowrap tracking-[-0.1504px] whitespace-pre">🔴 Saldo kritis!</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[24.005px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Frame1 />
      <Frame />
    </div>
  );
}

function Container1() {
  return <div className="bg-red-600 h-[11.999px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv() {
  return (
    <div className="bg-[rgba(250,250,250,0.2)] box-border content-stretch flex flex-col h-[11.999px] items-start overflow-clip pr-[322.925px] py-0 relative rounded-[1.683e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container1 />
    </div>
  );
}

function Paragraph() {
  return <div className="h-[19.992px] shrink-0 w-full" data-name="Paragraph" />;
}

export default function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[11.999px] items-start relative size-full" data-name="Container">
      <Container />
      <PrimitiveDiv />
      <Paragraph />
    </div>
  );
}