import svgPaths from "./svg-7jz5shil7u";

function Icon() {
  return (
    <div className="h-[19.992px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.323%]" data-name="Vector">
        <div className="absolute inset-[-4.999%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
            <path d={svgPaths.p18479600} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[83.33%] right-[16.67%] top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M0.833018 0.833018V4.16509" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[83.33%] left-3/4 right-[8.33%] top-[16.67%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 2">
            <path d="M4.16509 0.833018H0.833018" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[8.33%] left-[8.33%] right-3/4 top-3/4" data-name="Vector">
        <div className="absolute inset-[-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
            <path d={svgPaths.p277db500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66604" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0 size-[19.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[19.992px]">
        <Icon />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[24.005px] relative shrink-0 w-[90.495px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24.005px] relative w-[90.495px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-nowrap text-white top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Uang Dingin</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[24.005px] relative shrink-0 w-[118.481px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[7.994px] h-[24.005px] items-center relative w-[118.481px]">
        <Container />
        <Heading />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.995px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_183_43)" id="Icon">
          <path d={svgPaths.p1cd26a00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
          <path d="M7.99775 10.6637V7.99775" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
          <path d="M7.99775 5.33184H8.00442" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
        </g>
        <defs>
          <clipPath id="clip0_183_43">
            <rect fill="white" height="15.9955" width="15.9955" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[43.997px] relative rounded-[1.683e+07px] shrink-0 w-[23.997px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[23.997px]">
        <Icon1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="box-border content-stretch flex h-[43.997px] items-center justify-between pb-[0.5px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.5px] border-neutral-800 border-solid inset-0 pointer-events-none" />
      <Container1 />
      <Button />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[15.995px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] text-nowrap top-[0.5px] whitespace-pre">Saldo Hari Ini</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[28.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#00c950] text-[18px] text-nowrap top-[0.01px] tracking-[-0.4395px] whitespace-pre">Rp 1.917.904</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex gap-[81px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[15px] not-italic relative shrink-0 text-[#a1a1a1] text-[10px] tracking-[0.1172px] w-[109px]">Sampai 7 Nov 2025</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[3.997px] h-[66.992px] items-start relative shrink-0" data-name="Container">
      <Paragraph />
      <Paragraph1 />
      <Paragraph2 />
    </div>
  );
}

function HeartIcon() {
  return (
    <div className="relative shrink-0 size-[11.62px]" data-name="HeartIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_183_50)" id="HeartIcon">
          <path d={svgPaths.p5e3a500} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_183_50">
            <rect fill="white" height="11.6195" width="11.6195" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[14.523px] relative shrink-0 w-[38.007px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[14.523px] relative w-[38.007px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[14.528px] left-0 not-italic text-[10.17px] text-nowrap text-white top-[0.37px] tracking-[-0.1092px] whitespace-pre">Wishlist</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] box-border content-stretch flex gap-[5.807px] h-[31.962px] items-center justify-center pl-[0.364px] pr-[0.37px] py-[0.364px] relative rounded-[7.264px] shrink-0 w-[84.991px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.364px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[7.264px]" />
      <HeartIcon />
      <Text />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[80px] items-center relative shrink-0 w-full">
      <Container3 />
      <Button1 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[11.999px] items-start relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Frame />
    </div>
  );
}

export default function Container5() {
  return (
    <div className="bg-neutral-950 relative rounded-[10px] size-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col items-center justify-center pb-[16.5px] pt-[16.497px] px-[16.497px] relative size-full">
          <Container4 />
        </div>
      </div>
    </div>
  );
}