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
                      { title: "About Us", url: "https://fijiprincipalsassociation.org.fj/index.php/fpa-history" },
                      { title: "FPA Executives", url: "https://fijiprincipalsassociation.org.fj/index.php/executives" },
                      { title: "Conference Presentations", url: "https://fijiprincipalsassociation.org.fj/index.php/presentations/2025-fpa-conference/presidential-address" },
                      { title: "Publications", url: "https://fijiprincipalsassociation.org.fj/index.php/publications/2022-fpa-conference" },
                    ],
                  },
                  {
                    items: [
                      { title: "Gallery", url: "https://fijiprincipalsassociation.org.fj/index.php/gallery" },
                      { title: "Constitution", url: "https://fijiprincipalsassociation.org.fj/index.php/constitution" },
                      { title: "Contact Us", url: "https://fijiprincipalsassociation.org.fj/index.php/contact" },
                    ],
                  },
                ].map(({ items }, idx) => (
                  <div key={idx}>
                    {items.map((item, i) => (
                      <li key={i} className="mt-1 hover:text-white">
                        <Link target="_blank" href={item.url}>{item.title}</Link>
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
              <li className="hover:text-white">
                <Link href="/legal?tab=privacy">Privacy Policy</Link>
              </li>
              <li className="hover:text-white">
                <Link href="/legal?tab=terms">Terms & Conditions</Link>
              </li>
              <li className="hover:text-white">
                <Link href="/support">Help and Support</Link>
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
