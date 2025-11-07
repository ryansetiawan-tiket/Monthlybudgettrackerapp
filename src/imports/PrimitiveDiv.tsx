import svgPaths from "./svg-ffmxybbtaj";

function ExpenseListComponent() {
  return (
    <div className="h-[24.005px] relative shrink-0 w-[139.579px]" data-name="ExpenseListComponent">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Daftar Transaksi</p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] box-border content-stretch flex gap-[6px] items-center justify-center px-[12.502px] py-[0.502px] relative rounded-[8px] shrink-0 size-[32px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#a1a1a1] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre">📊</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-between relative w-full">
        <ExpenseListComponent />
        <Button />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[10.49px] size-[13.997px] top-[15px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1133)" id="Icon">
          <path d={svgPaths.p1d028f00} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p29a1c300} id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1133">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[rgba(38,38,38,0.3)] h-[43.997px] left-0 rounded-[8px] top-0 w-[74.382px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[36.48px] not-italic text-[12px] text-neutral-50 text-nowrap top-[14.5px] whitespace-pre">Lock</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-[rgba(38,38,38,0.3)] box-border content-stretch flex gap-[6px] h-[43.997px] items-center justify-center left-[94.37px] px-[12.502px] py-[0.502px] rounded-[8px] top-0 w-[49.46px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap whitespace-pre">Pilih</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.995px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p35eda340} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
          <path d="M11.3302 13.3296V2.66592" id="Vector_2" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
          <path d={svgPaths.p19b4a280} id="Vector_3" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
          <path d="M4.66536 2.66592V13.3296" id="Vector_4" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute content-stretch flex h-[43.997px] items-center justify-center left-[157.82px] rounded-[8px] top-0 w-[31.999px]" data-name="Button">
      <Icon1 />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[19.992px] left-[195.81px] top-[12px] w-[82.791px]" data-name="Text">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">Rp 4.168.170</p>
    </div>
  );
}

function ExpenseListComponent1() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[278.601px]" data-name="ExpenseListComponent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[43.997px] relative w-[278.601px]">
        <Button1 />
        <Button2 />
        <Button3 />
        <Text />
      </div>
    </div>
  );
}

function CardTitle() {
  return (
    <div className="relative shrink-0 w-[297.198px]" data-name="CardTitle">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[7.994px] items-start relative w-[297.198px]">
        <Frame />
        <ExpenseListComponent1 />
      </div>
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="basis-0 bg-[rgba(255,76,76,0.1)] grow h-[43.997px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[#ff4c4c] border-[0.502px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[6px] h-[43.997px] items-center justify-center px-[12.502px] py-[6.502px] relative w-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap tracking-[-0.1504px] whitespace-pre">Pengeluaran</p>
        </div>
      </div>
    </div>
  );
}

function PrimitiveButton1() {
  return (
    <div className="basis-0 grow h-[43.997px] min-h-px min-w-px relative rounded-[10px] shrink-0" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[0.502px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[6px] h-[43.997px] items-center justify-center px-[12.502px] py-[6.502px] relative w-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#a1a1a1] text-[14px] text-nowrap tracking-[-0.1504px] whitespace-pre">Pemasukan</p>
        </div>
      </div>
    </div>
  );
}

function TabList() {
  return (
    <div className="bg-neutral-800 relative rounded-[14px] shrink-0 w-full" data-name="Tab List">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center justify-between px-[3px] py-0 relative w-full">
          <PrimitiveButton />
          <PrimitiveButton1 />
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-[rgba(38,38,38,0.3)] h-[35.996px] left-0 rounded-[8px] top-0 w-[297.198px]" data-name="Input">
      <div className="box-border content-stretch flex h-[35.996px] items-center overflow-clip pl-[36px] pr-[12px] py-[4px] relative rounded-[inherit] w-[297.198px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#a1a1a1] text-[16px] text-nowrap tracking-[-0.3125px] whitespace-pre">Cari nama, hari, atau tanggal...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[12px] size-[15.995px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p12f5a380} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
          <path d={svgPaths.p2b54a140} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[35.996px] relative shrink-0 w-full" data-name="Container">
      <Input />
      <Icon2 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[14.491px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
        <g id="Icon">
          <path d={svgPaths.p1e904040} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.20757" />
        </g>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[48.01px] relative shrink-0 w-[137.447px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[48.01px] relative w-[137.447px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[0.02px] not-italic text-[16px] text-neutral-50 top-[-0.74px] tracking-[-0.3125px] w-[91px]">{`Hari Ini & Mendatang`}</p>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[15.995px] relative shrink-0 w-[16.591px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[15.995px] relative w-[16.591px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] top-[0.5px] w-[17px]">(5)</p>
      </div>
    </div>
  );
}

function ExpenseListComponent2() {
  return (
    <div className="h-[48.01px] relative shrink-0 w-[184.517px]" data-name="ExpenseListComponent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[7.994px] h-[48.01px] items-center relative w-[184.517px]">
        <Icon3 />
        <Text1 />
        <Text2 />
      </div>
    </div>
  );
}

function ExpenseListComponent3() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[88.684px]" data-name="ExpenseListComponent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[88.684px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">Rp 2.440.469</p>
      </div>
    </div>
  );
}

function SlotClone() {
  return (
    <div className="bg-[rgba(38,38,38,0.5)] h-[72.007px] relative rounded-[10px] shrink-0 w-full" data-name="SlotClone">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[72.007px] items-center justify-between px-[11.999px] py-0 relative w-full">
          <ExpenseListComponent2 />
          <ExpenseListComponent3 />
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[#2b7fff] opacity-[0.608] relative rounded-[1.683e+07px] shrink-0 size-[7.994px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[7.994px]" />
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute content-stretch flex h-[19.06px] items-start left-0 top-[2.01px] w-[16.05px]" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-neutral-50 text-nowrap tracking-[-0.3125px] whitespace-pre">📦</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[24.005px] left-0 overflow-clip top-0 w-[70.354px]" data-name="Paragraph">
      <Text3 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[20.05px] not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Nindya</p>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[84.868px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[84.868px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">Jumat, 7 Nov</p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[6.458px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[6.458px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">•</p>
      </div>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-neutral-800 h-[20.996px] relative rounded-[8px] shrink-0 w-[87.446px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20.996px] items-center justify-center overflow-clip px-[8.502px] py-[2.502px] relative rounded-[inherit] w-[87.446px]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap whitespace-pre">Uang Dingin</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.502px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex gap-[5.995px] h-[20.996px] items-center left-0 top-[24px] w-[256.21px]" data-name="Container">
      <Text4 />
      <Text5 />
      <Badge />
    </div>
  );
}

function Container3() {
  return (
    <div className="basis-0 grow h-[45.001px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[45.001px] relative w-full">
        <Paragraph />
        <Container2 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[7.994px] h-full items-center relative w-[272.198px]">
        <Container1 />
        <Container3 />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[80.228px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[80.228px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] top-[0.51px] tracking-[-0.1504px] w-[81px]">-Rp 100.000</p>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1129)" id="Icon">
          <path d={svgPaths.p395c5e00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p304b6800} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1129">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon4 />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1137)" id="Icon">
          <path d={svgPaths.p2ae95200} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p17072700} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1137">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon5 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1141)" id="Icon">
          <path d="M5.8321 6.41531V9.91458" id="Vector" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M8.16495 6.41531V9.91458" id="Vector_2" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p173e5a00} id="Vector_3" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M1.74963 3.49926H12.2474" id="Vector_4" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p27486f00} id="Vector_5" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1141">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon6 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[115.981px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[9.992px] h-[43.997px] items-center relative w-[115.981px]">
        <Button4 />
        <Button5 />
        <Button6 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-between relative w-[272.198px]">
        <Paragraph1 />
        <Container5 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[rgba(255,255,255,0)] h-[121.992px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_0px_0px_2px_#2b7fff]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[7.994px] h-[121.992px] items-start pl-[12.5px] pr-[0.502px] py-[12.5px] relative w-full">
          <Container4 />
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[24.005px] left-0 overflow-clip top-0 w-[59.068px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Laundry</p>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[94.061px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[94.061px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">Minggu, 9 Nov</p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[6.458px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[6.458px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">•</p>
      </div>
    </div>
  );
}

function Badge1() {
  return (
    <div className="bg-neutral-800 h-[20.996px] relative rounded-[8px] shrink-0 w-[81.31px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20.996px] items-center justify-center overflow-clip px-[8.502px] py-[2.502px] relative rounded-[inherit] w-[81.31px]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap whitespace-pre">Sehari-hari</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.502px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex gap-[5.995px] h-[20.996px] items-center left-0 top-[24px] w-[272.198px]" data-name="Container">
      <Text6 />
      <Text7 />
      <Badge1 />
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[272.198px]">
        <Paragraph2 />
        <Container8 />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[73.849px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[73.849px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] top-[0.51px] tracking-[-0.1504px] w-[74px]">-Rp 30.000</p>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1129)" id="Icon">
          <path d={svgPaths.p395c5e00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p304b6800} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1129">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon7 />
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1137)" id="Icon">
          <path d={svgPaths.p2ae95200} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p17072700} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1137">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon8 />
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1141)" id="Icon">
          <path d="M5.8321 6.41531V9.91458" id="Vector" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M8.16495 6.41531V9.91458" id="Vector_2" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p173e5a00} id="Vector_3" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M1.74963 3.49926H12.2474" id="Vector_4" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p27486f00} id="Vector_5" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1141">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon9 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[115.981px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[9.992px] h-[43.997px] items-center relative w-[115.981px]">
        <Button7 />
        <Button8 />
        <Button9 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-between relative w-[272.198px]">
        <Paragraph3 />
        <Container10 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[121.992px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[7.994px] h-[121.992px] items-start pl-[12.5px] pr-[0.502px] py-[12.5px] relative w-full">
          <Container9 />
          <Container11 />
        </div>
      </div>
    </div>
  );
}

function Text8() {
  return (
    <div className="absolute content-stretch flex h-[19.06px] items-start left-0 top-[2.01px] w-[16.05px]" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-neutral-50 text-nowrap tracking-[-0.3125px] whitespace-pre">💳</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[24.005px] left-0 overflow-clip top-0 w-[39.781px]" data-name="Paragraph">
      <Text8 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[20.05px] not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">SP</p>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[100.401px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[100.401px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">Minggu, 16 Nov</p>
      </div>
    </div>
  );
}

function Text10() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[6.458px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[6.458px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">•</p>
      </div>
    </div>
  );
}

function Badge2() {
  return (
    <div className="bg-neutral-800 h-[20.996px] relative rounded-[8px] shrink-0 w-[64.045px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20.996px] items-center justify-center overflow-clip px-[8.502px] py-[2.502px] relative rounded-[inherit] w-[64.045px]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap whitespace-pre">Paylater</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.502px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex gap-[5.995px] h-[20.996px] items-center left-0 top-[24px] w-[272.198px]" data-name="Container">
      <Text9 />
      <Text10 />
      <Badge2 />
    </div>
  );
}

function Container14() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[272.198px]">
        <Paragraph4 />
        <Container13 />
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[79.351px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[79.351px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] top-[0.51px] tracking-[-0.1504px] w-[80px]">-Rp 376.631</p>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1129)" id="Icon">
          <path d={svgPaths.p395c5e00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p304b6800} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1129">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon10 />
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1137)" id="Icon">
          <path d={svgPaths.p2ae95200} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p17072700} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1137">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon11 />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1141)" id="Icon">
          <path d="M5.8321 6.41531V9.91458" id="Vector" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M8.16495 6.41531V9.91458" id="Vector_2" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p173e5a00} id="Vector_3" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M1.74963 3.49926H12.2474" id="Vector_4" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p27486f00} id="Vector_5" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1141">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon12 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[115.981px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[9.992px] h-[43.997px] items-center relative w-[115.981px]">
        <Button10 />
        <Button11 />
        <Button12 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-between relative w-[272.198px]">
        <Paragraph5 />
        <Container15 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[121.992px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[7.994px] h-[121.992px] items-start pl-[12.5px] pr-[0.502px] py-[12.5px] relative w-full">
          <Container14 />
          <Container16 />
        </div>
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="absolute content-stretch flex h-[19.06px] items-start left-0 top-[2.01px] w-[16.05px]" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-neutral-50 text-nowrap tracking-[-0.3125px] whitespace-pre">👨‍👩‍👧‍👦</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[24.005px] left-0 overflow-clip top-0 w-[58.684px]" data-name="Paragraph">
      <Text11 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[20.05px] not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Hotel</p>
    </div>
  );
}

function Text12() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[87.203px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[87.203px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">Rabu, 26 Nov</p>
      </div>
    </div>
  );
}

function Text13() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[6.458px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[6.458px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">•</p>
      </div>
    </div>
  );
}

function Badge3() {
  return (
    <div className="bg-neutral-800 h-[20.996px] relative rounded-[8px] shrink-0 w-[87.446px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20.996px] items-center justify-center overflow-clip px-[8.502px] py-[2.502px] relative rounded-[inherit] w-[87.446px]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap whitespace-pre">Uang Dingin</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.502px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex gap-[5.995px] h-[20.996px] items-center left-0 top-[24px] w-[272.198px]" data-name="Container">
      <Text12 />
      <Text13 />
      <Badge3 />
    </div>
  );
}

function Container19() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[272.198px]">
        <Paragraph6 />
        <Container18 />
      </div>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[90.009px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[90.009px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] top-[0.51px] tracking-[-0.1504px] w-[91px]">-Rp 1.557.208</p>
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1129)" id="Icon">
          <path d={svgPaths.p395c5e00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p304b6800} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1129">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon13 />
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1137)" id="Icon">
          <path d={svgPaths.p2ae95200} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p17072700} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1137">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button14() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon14 />
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1141)" id="Icon">
          <path d="M5.8321 6.41531V9.91458" id="Vector" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M8.16495 6.41531V9.91458" id="Vector_2" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p173e5a00} id="Vector_3" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M1.74963 3.49926H12.2474" id="Vector_4" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p27486f00} id="Vector_5" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1141">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button15() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon15 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[115.981px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[9.992px] h-[43.997px] items-center relative w-[115.981px]">
        <Button13 />
        <Button14 />
        <Button15 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-between relative w-[272.198px]">
        <Paragraph7 />
        <Container20 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[121.992px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[7.994px] h-[121.992px] items-start pl-[12.5px] pr-[0.502px] py-[12.5px] relative w-full">
          <Container19 />
          <Container21 />
        </div>
      </div>
    </div>
  );
}

function Text14() {
  return (
    <div className="absolute content-stretch flex h-[19.06px] items-start left-0 top-[2.01px] w-[16.05px]" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-neutral-50 text-nowrap tracking-[-0.3125px] whitespace-pre">💳</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="absolute h-[24.005px] left-0 overflow-clip top-0 w-[39.381px]" data-name="Paragraph">
      <Text14 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[20.05px] not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Sp</p>
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[83.826px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[83.826px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">Rabu, 17 Des</p>
      </div>
    </div>
  );
}

function Text16() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[6.458px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[6.458px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#a1a1a1] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">•</p>
      </div>
    </div>
  );
}

function Badge4() {
  return (
    <div className="bg-neutral-800 h-[20.996px] relative rounded-[8px] shrink-0 w-[64.045px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[4px] h-[20.996px] items-center justify-center overflow-clip px-[8.502px] py-[2.502px] relative rounded-[inherit] w-[64.045px]">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap whitespace-pre">Paylater</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.502px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute content-stretch flex gap-[5.995px] h-[20.996px] items-center left-0 top-[24px] w-[272.198px]" data-name="Container">
      <Text15 />
      <Text16 />
      <Badge4 />
    </div>
  );
}

function Container24() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[272.198px]">
        <Paragraph8 />
        <Container23 />
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[81.678px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[81.678px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] top-[0.51px] tracking-[-0.1504px] w-[82px]">-Rp 376.630</p>
      </div>
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1129)" id="Icon">
          <path d={svgPaths.p395c5e00} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p304b6800} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1129">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button16() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon16 />
      </div>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1137)" id="Icon">
          <path d={svgPaths.p2ae95200} id="Vector" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p17072700} id="Vector_2" stroke="var(--stroke-0, #A1A1A1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1137">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button17() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon17 />
      </div>
    </div>
  );
}

function Icon18() {
  return (
    <div className="relative shrink-0 size-[13.997px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_189_1141)" id="Icon">
          <path d="M5.8321 6.41531V9.91458" id="Vector" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M8.16495 6.41531V9.91458" id="Vector_2" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p173e5a00} id="Vector_3" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d="M1.74963 3.49926H12.2474" id="Vector_4" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
          <path d={svgPaths.p27486f00} id="Vector_5" stroke="var(--stroke-0, #82181A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16642" />
        </g>
        <defs>
          <clipPath id="clip0_189_1141">
            <rect fill="white" height="13.997" width="13.997" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button18() {
  return (
    <div className="h-[43.997px] relative rounded-[8px] shrink-0 w-[31.999px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[31.999px]">
        <Icon18 />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[115.981px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[9.992px] h-[43.997px] items-center relative w-[115.981px]">
        <Button16 />
        <Button17 />
        <Button18 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[43.997px] relative shrink-0 w-[272.198px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[43.997px] items-center justify-between relative w-[272.198px]">
        <Paragraph9 />
        <Container25 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[121.992px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[7.994px] h-[121.992px] items-start pl-[12.5px] pr-[0.502px] py-[12.5px] relative w-full">
          <Container24 />
          <Container26 />
        </div>
      </div>
    </div>
  );
}

function ExpenseListComponent4() {
  return (
    <div className="content-stretch flex flex-col gap-[11.999px] h-[657.955px] items-start relative shrink-0 w-full" data-name="ExpenseListComponent">
      <Container7 />
      <Container12 />
      <Container17 />
      <Container22 />
      <Container27 />
    </div>
  );
}

function PrimitiveDiv() {
  return (
    <div className="content-stretch flex flex-col gap-[11.999px] h-[741.961px] items-start relative shrink-0 w-full" data-name="Primitive.div">
      <SlotClone />
      <ExpenseListComponent4 />
    </div>
  );
}

function Icon19() {
  return (
    <div className="relative shrink-0 size-[15.995px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p3a0c2780} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33296" />
        </g>
      </svg>
    </div>
  );
}

function Text17() {
  return (
    <div className="basis-0 grow h-[24.005px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24.005px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-neutral-50 text-nowrap top-[-0.99px] tracking-[-0.3125px] whitespace-pre">Riwayat</p>
      </div>
    </div>
  );
}

function Text18() {
  return (
    <div className="h-[15.995px] relative shrink-0 w-[21.568px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[15.995px] relative w-[21.568px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#a1a1a1] text-[12px] top-[0.5px] w-[22px]">(17)</p>
      </div>
    </div>
  );
}

function ExpenseListComponent5() {
  return (
    <div className="h-[24.005px] relative shrink-0 w-[109.445px]" data-name="ExpenseListComponent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[7.994px] h-[24.005px] items-center relative w-[109.445px]">
        <Icon19 />
        <Text17 />
        <Text18 />
      </div>
    </div>
  );
}

function ExpenseListComponent6() {
  return (
    <div className="h-[19.992px] relative shrink-0 w-[79.296px]" data-name="ExpenseListComponent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[19.992px] relative w-[79.296px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#e7000b] text-[14px] text-nowrap top-[0.51px] tracking-[-0.1504px] whitespace-pre">Rp 1.727.701</p>
      </div>
    </div>
  );
}

function SlotClone1() {
  return (
    <div className="bg-[rgba(38,38,38,0.5)] h-[48.002px] relative rounded-[10px] shrink-0 w-full" data-name="SlotClone">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[48.002px] items-center justify-between px-[11.999px] py-0 relative w-full">
          <ExpenseListComponent5 />
          <ExpenseListComponent6 />
        </div>
      </div>
    </div>
  );
}

function ExpenseListComponent7() {
  return (
    <div className="h-[857.95px] relative shrink-0 w-[297.198px]" data-name="ExpenseListComponent">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[15.995px] h-[857.95px] items-start relative w-[297.198px]">
        <TabList />
        <Container />
        <PrimitiveDiv />
        <SlotClone1 />
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-neutral-950 h-[1024.94px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.502px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[27px] h-[1024.94px] items-start pb-[0.502px] pl-[24.499px] pr-[0.502px] pt-[24.499px] relative w-full">
          <CardTitle />
          <ExpenseListComponent7 />
        </div>
      </div>
    </div>
  );
}

function TabPanel() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[346.196px]" data-name="Tab Panel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[11.999px] h-full items-start relative w-[346.196px]">
        <Card />
      </div>
    </div>
  );
}

export default function PrimitiveDiv1() {
  return (
    <div className="content-stretch flex flex-col gap-[23.989px] items-start relative size-full" data-name="Primitive.div">
      <TabPanel />
    </div>
  );
}