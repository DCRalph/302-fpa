"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useEffect, useState } from "react";

export function LegalTabs({ initialTab }: { initialTab?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(initialTab ?? "privacy");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "privacy" || tabParam === "terms") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/legal?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
        <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
      </TabsList>

      <TabsContent value="privacy" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to the Fiji Principals Association (FPA) Conference Registration Platform.
                We are committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-2">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Personal identification information (name, email address, phone number)</li>
                <li>Professional information (school name, position, membership details)</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Conference registration details</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Process and manage your conference registrations</li>
                <li>Communicate with you about conference updates and important information</li>
                <li>Provide customer support and respond to your inquiries</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share
                your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>With service providers who assist us in operating our platform</li>
                <li>When required by law or to protect our rights</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction. However,
                no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of certain communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy, please contact us through our support page
                or email us at support@fijiprincipalsassociation.org.fj
              </p>
            </section>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="terms" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using the Fiji Principals Association Conference Registration Platform,
                you accept and agree to be bound by these Terms and Conditions. If you do not agree with
                any part of these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Use of the Platform</h2>
              <p className="text-muted-foreground mb-2">
                You agree to use the platform only for lawful purposes and in accordance with these Terms.
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Use the platform in any way that violates applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Transmit any malicious code or harmful content</li>
                <li>{`Interfere with or disrupt the platform's operation`}</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Registration and Account</h2>
              <p className="text-muted-foreground mb-4">
                To use certain features of the platform, you must register for an account. You are
                responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. You agree to provide accurate and complete
                information during registration and to update such information as necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Conference Registration</h2>
              <p className="text-muted-foreground mb-2">
                When registering for a conference:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Registration is subject to availability</li>
                <li>Fees are as displayed at the time of registration</li>
                <li>Refund policies apply as specified for each conference</li>
                <li>You must provide accurate registration information</li>
                <li>Registration may be subject to approval by FPA administrators</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Payment Terms</h2>
              <p className="text-muted-foreground mb-4">
                {`All payments must be made through the designated payment methods. Payment processing
                is handled by secure third-party providers. You are responsible for ensuring sufficient
                funds are available for transactions. Refunds are subject to the conference's refund
                policy and administrative approval.`}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content on this platform, including text, graphics, logos, and software, is the
                property of the Fiji Principals Association or its licensors and is protected by
                copyright and other intellectual property laws. You may not reproduce, distribute, or
                create derivative works without prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                To the maximum extent permitted by law, the Fiji Principals Association shall not be
                liable for any indirect, incidental, special, consequential, or punitive damages arising
                from your use of the platform, including but not limited to loss of data, loss of profits,
                or business interruption.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Modifications to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms and Conditions at any time. Your continued
                use of the platform after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms and Conditions, please contact us through our support
                page or email us at support@fijiprincipalsassociation.org.fj
              </p>
            </section>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

