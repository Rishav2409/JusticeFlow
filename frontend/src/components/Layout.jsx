import { NavLink } from 'react-router-dom';

const JusticeLogo = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="18"
        fill="#FFFFFF"
      />

      {/* Top circle */}
      <circle
        cx="50"
        cy="19"
        r="6"
        fill="#C65A16"
      />

      {/* Central pillar */}
      <rect
        x="47"
        y="24"
        width="6"
        height="48"
        rx="3"
        fill="#2B170D"
      />

      {/* Balance beam */}
      <rect
        x="19"
        y="25"
        width="62"
        height="6"
        rx="3"
        fill="#2B170D"
      />

      {/* Left suspension */}
      <line
        x1="28"
        y1="31"
        x2="28"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="28"
        y1="31"
        x2="17"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="28"
        y1="31"
        x2="39"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Right suspension */}
      <line
        x1="72"
        y1="31"
        x2="72"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="72"
        y1="31"
        x2="61"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="72"
        y1="31"
        x2="83"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left scale */}
      <path
        d="M13 51 Q28 63 43 51"
        fill="none"
        stroke="#C65A16"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Right scale */}
      <path
        d="M57 51 Q72 63 87 51"
        fill="none"
        stroke="#C65A16"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Base */}
      <rect
        x="39"
        y="72"
        width="22"
        height="5"
        rx="2.5"
        fill="#2B170D"
      />

      <rect
        x="32"
        y="77"
        width="36"
        height="6"
        rx="3"
        fill="#C65A16"
      />

    </svg>
  );
};


const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-white text-[#2B170D]">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}
      <aside
        className="
          w-64
          md:w-72
          flex-shrink-0
          min-h-screen
          bg-[#2B170D]
          text-white
          flex
          flex-col
        "
      >

        {/* =================================================
            BRAND
            ================================================= */}
        <div className="px-4 py-6 md:px-6 md:py-7">

          <div className="flex items-center gap-3 md:gap-4">

            {/* Logo */}
            <div
              className="
                h-11
                w-11
                md:h-12
                md:w-12
                flex-shrink-0
                rounded-xl
                bg-white
                p-1
                shadow-lg
                overflow-hidden
              "
            >
              <JusticeLogo />
            </div>

            {/* Brand */}
            <div className="min-w-0">

              <h1
                className="
                  text-xl
                  md:text-2xl
                  font-bold
                  tracking-wide
                  text-white
                  leading-tight
                "
              >
                JusticeFlow
              </h1>

              <p
                className="
                  mt-1
                  text-[10px]
                  md:text-xs
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-[#F0A46F]
                  whitespace-nowrap
                "
              >
                Legal-Aid Screening
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            NAVIGATION
            ================================================= */}
        <nav className="flex-1 px-3 md:px-4">

          <p
            className="
              px-3
              mb-4
              text-[10px]
              md:text-xs
              font-bold
              uppercase
              tracking-[0.18em]
              text-[#D8B9A0]
            "
          >
            Case Management
          </p>


          <div className="space-y-2">

            {/* ALL CASES */}
            <NavLink
              to="/cases"
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3
                rounded-lg
                px-4
                py-3
                md:py-3.5
                text-sm
                md:text-base
                font-semibold
                transition-all
                duration-200
                ${
                  isActive
                    ? `
                      bg-[#C65A16]
                      text-white
                      shadow-md
                      `
                    : `
                      bg-transparent
                      text-[#F5E8DE]
                      hover:bg-[#4A2A1A]
                      hover:text-white
                      `
                }
                `
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`
                      flex
                      h-6
                      w-6
                      flex-shrink-0
                      items-center
                      justify-center
                      text-base
                      ${
                        isActive
                          ? 'text-white'
                          : 'text-[#E47C3B]'
                      }
                    `}
                  >
                    ▣
                  </span>

                  <span>All Cases</span>
                </>
              )}
            </NavLink>


            {/* NEW CASE */}
            <NavLink
              to="/add-case"
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3
                rounded-lg
                px-4
                py-3
                md:py-3.5
                text-sm
                md:text-base
                font-semibold
                transition-all
                duration-200
                ${
                  isActive
                    ? `
                      bg-[#C65A16]
                      text-white
                      shadow-md
                      `
                    : `
                      bg-transparent
                      text-[#F5E8DE]
                      hover:bg-[#4A2A1A]
                      hover:text-white
                      `
                }
                `
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`
                      flex
                      h-6
                      w-6
                      flex-shrink-0
                      items-center
                      justify-center
                      text-xl
                      leading-none
                      ${
                        isActive
                          ? 'text-white'
                          : 'text-[#E47C3B]'
                      }
                    `}
                  >
                    ＋
                  </span>

                  <span>New Case</span>
                </>
              )}
            </NavLink>

          </div>

        </nav>


        {/* =================================================
            DEMO ENVIRONMENT
            ================================================= */}
        <div className="border-t border-[#4A2A1A] p-3 md:p-4">

          <div
            className="
              rounded-lg
              border
              border-[#5C3824]
              bg-[#351C10]
              px-3
              py-3
              md:px-4
              md:py-4
            "
          >

            <div className="flex items-center gap-2">

              <span
                className="
                  h-2.5
                  w-2.5
                  flex-shrink-0
                  rounded-full
                  bg-[#E06B1F]
                "
              />

              <span
                className="
                  text-[10px]
                  md:text-xs
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  text-[#F5E8DE]
                "
              >
                Demo Environment
              </span>

            </div>

            <p
              className="
                mt-2
                text-[11px]
                md:text-xs
                leading-relaxed
                text-[#BFA99A]
              "
            >
              Synthetic case data only
            </p>

          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN APPLICATION AREA
          ===================================================== */}
      <main
        className="
          min-w-0
          flex-1
          min-h-screen
          bg-white
          flex
          flex-col
        "
      >

        {/* =================================================
            DEMO BANNER
            ================================================= */}
        <div
          className="
            w-full
            border-b
            border-[#E8C9B0]
            bg-[#FFF4EC]
            px-4
            py-3
            text-center
            text-xs
            md:text-sm
            font-medium
            text-[#7A3A12]
          "
        >
          <span className="mr-2">⚠</span>

          Demo environment — synthetic case data only.
          This is not a production system.
        </div>


        {/* =================================================
            CONTENT
            ================================================= */}
        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            py-6
            sm:px-6
            sm:py-8
            md:px-10
            md:py-10
          "
        >

          <div
            className="
              mx-auto
              flex
              min-h-full
              w-full
              max-w-6xl
              flex-col
            "
          >

            {/* Page Content */}
            <div className="flex-1 min-w-0">
              {children}
            </div>


            {/* =================================================
                FOOTER
                ================================================= */}
            <footer
              className="
                mt-10
                border-t
                border-[#E8D5C4]
                pb-5
                pt-5
              "
            >

              <p
                className="
                  mx-auto
                  max-w-4xl
                  text-center
                  text-[11px]
                  md:text-xs
                  leading-relaxed
                  text-[#806F64]
                "
              >
                This prototype provides preliminary case screening
                based on configured statutory rules. It does not
                constitute legal advice, determine final entitlement
                to bail, or replace review by a qualified legal
                professional or competent court.
              </p>

              <p
                className="
                  mt-3
                  text-center
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-[#A08D81]
                "
              >
                JusticeFlow • Legal-Aid Screening Assistant
              </p>

            </footer>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Layout;