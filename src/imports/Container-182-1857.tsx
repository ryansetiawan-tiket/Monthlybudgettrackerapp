import svgPaths from "./svg-f312o1132i";

function Icon() {
  return (
    <div className="h-[19.992px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.323%]" data-name="Vector">
        <div className="absolute inset-[-4.999%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
            <path d={svgPaths.p18479600} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[83.33%] right-[16.67%] top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M0.833018 0.833018V4.16509" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[83.33%] left-3/4 right-[8.33%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 2">
            <path d="M4.16509 0.833018H0.833018" id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[8.33%] left-[8.33%] right-3/4 top-3/4" data-name="Vector">
        <div className="absolute inset-[-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d={svgPaths.p277db500} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[19.992px] top-[10px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[24.005px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Uang Dingin</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[1.907e_-5px] h-[40.001px] items-start justify-center left-[27.99px] top-0 w-[162.385px]" data-name="Container">
      <Heading />
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[40.001px] relative shrink-0 w-[190.371px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40.001px] relative w-[190.371px]">
        <Container />
        <Container1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[65px] h-[40.001px] items-center relative shrink-0 w-full" data-name="Container">
      <Frame />
      <div className="relative shrink-0 size-[24px]" data-name="tds_ic_information_disable">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border relative size-[24px]">
          <div className="absolute inset-[8.333%]" data-name="vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)", "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <path d={svgPaths.p34374970} fill="var(--fill-0, white)" id="vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[15.995px] left-0 top-[8.53px] w-[74.742px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-[0.5px] whitespace-pre">Saldo Hari Ini</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute content-stretch flex h-[21.568px] items-start left-[171.83px] top-[3.01px] w-[107.423px]" data-name="Text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] not-italic relative shrink-0 text-[#00a63e] text-[18px] text-nowrap tracking-[-0.4395px] whitespace-pre">Rp 1.917.904</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[28.002px] relative shrink-0 w-full" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[15px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-0 not-italic text-[#a1a1a1] text-[10px] top-px tracking-[0.1172px] w-[108px]">Sampai 7 Nov 2025</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[3.997px] h-[46.999px] items-start relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Paragraph />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-[122.246px]">
      <div className="relative shrink-0 size-[16px]" data-name="tds_ic_wishlist">
        <div className="absolute inset-[12.5%_8.33%]" data-name="vector">
          <div className="absolute bottom-0 left-0 right-0 top-[0.01%]" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 12">
              <path d={svgPaths.p24525b80} fill="var(--fill-0, white)" id="vector" />
            </svg>
          </div>
        </div>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">Wishlist</p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] relative rounded-[8px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center justify-between px-[79px] py-[11px] relative w-full">
          <Frame1 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[7.994px] h-[68px] items-start pb-0 pt-[12.5px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.502px_0px_0px] border-neutral-800 border-solid inset-0 pointer-events-none" />
      <Button />
    </div>
  );
}

export default function Container6() {
  return (
    <div className="bg-neutral-950 relative rounded-[10px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[12px] items-start p-[16px] relative size-full">
          <Container2 />
          <Container4 />
          <Container5 />
        </div>
      </div>
    </div>
  );
}