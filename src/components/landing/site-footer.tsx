import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-[#10182B] to-[#131D33] py-12 text-white">
      <div className="container mx-auto grid gap-10 px-4 md:grid-cols-3">
        <div>
          <h4 className="font-semibold">Fiji Principals Association</h4>
          <p className="mt-3 text-sm text-white/70">
            Helping school leaders connect, collaborate, and manage conferences with ease.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="#">About Us</Link></li>
            <li><Link href="#">FPA Executives</Link></li>
            <li><Link href="#">Conference Presentations</Link></li>
            <li><Link href="#">Publications</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Legal & Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><Link href="#">Privacy Policy</Link></li>
            <li><Link href="#">Terms & Conditions</Link></li>
            <li><Link href="#">Help and Support</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-10 border-t border-white/10 px-4 py-6 text-center text-xs text-white/60">
        © 2025 Fiji Principals Association. All rights reserved.
      </div>
    </footer>
  );
}


