import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-[#10182B] to-[#131D33] py-12 text-white">
      <div className="px-4">
        <div className="container mx-auto grid gap-10 md:flex md:grid-cols-3 md:justify-between">
          <div>
            <h4 className="font-semibold text-xl">Fiji Principals Association</h4>
            <p className="mt-3 max-w-100 text-[16px] text-white/70">
              Helping school leaders connect, collaborate, and manage
              conferences with ease.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-xl">Quick Links</h4>
            <ul className="mt-3 grid space-y-2 text-[16px] text-white/70 md:grid-cols-2">
              <ul className="grid md:flex md:justify-between md:gap-10">
                {[
                  {
                    items: [
                      "About Us",
                      "FPA Executives",
                      "Conference Presentations",
                      "Publications",
                    ],
                  },
                  {
                    items: ["Gallery", "Constitution", "Contact Us"],
                  },
                ].map(({ items }, idx) => (
                  <div key={idx}>
                    {items.map((item, i) => (
                      <li key={i} className="mt-1">
                        <Link href="#">{item}</Link>
                      </li>
                    ))}
                  </div>
                ))}
              </ul>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xl">Legal & Support</h4>
            <ul className="mt-3 space-y-2 text-[16px] text-white/70">
              <li>
                <Link href="#">Privacy Policy</Link>
              </li>
              <li>
                <Link href="#">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="#">Help and Support</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-10 border-t border-white/10 pt-10 text-center text-[16px] text-white">
          © {new Date().getFullYear()} Fiji Principals Association. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
