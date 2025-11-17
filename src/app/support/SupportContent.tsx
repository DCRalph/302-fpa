"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Mail, MessageCircle, HelpCircle, Clock, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

export function SupportContent() {
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help and Support</h1>
          <p className="text-xl text-muted-foreground">
            {`We're here to help you with any questions or issues you may have`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                <CardTitle>Frequently Asked Questions</CardTitle>
              </div>
              <CardDescription>
                Find answers to common questions about registration, payments, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsFaqOpen(!isFaqOpen)}
              >
                <span>View FAQ</span>
                <ChevronDown
                  className={cn(
                    "ml-2 h-4 w-4 transition-transform duration-300",
                    isFaqOpen && "rotate-180"
                  )}
                />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <CardTitle>Contact Support</CardTitle>
              </div>
              <CardDescription>
                Get in touch with our support team for personalized assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const contactSection = document.getElementById("contact-support");
                  contactSection?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out mb-12",
            isFaqOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
              <CardHeader>
                <CardTitle>Common Questions</CardTitle>
                <CardDescription>Quick answers to frequently asked questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How do I register for a conference?</h3>
                  <p className="text-muted-foreground text-sm">
                    {`Navigate to the Conference Registration section in your member dashboard. Select the
                  conference you wish to attend, choose your ticket type, and complete the registration form.
                  You'll receive a confirmation email once your registration is processed.`}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
                  <p className="text-muted-foreground text-sm">
                    {`We accept major credit cards and debit cards through our secure payment processor.
                  Payment is processed securely and you'll receive a receipt via email.`}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I cancel my registration?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes, you can cancel your registration through your member dashboard. Refund eligibility
                    depends on the cancellation policy for each specific conference. Please check the
                    conference details for specific refund terms.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">How do I update my profile information?</h3>
                  <p className="text-muted-foreground text-sm">
                    {`Visit the "My Profile" section in your member dashboard. You can update your personal
                  information, contact details, and preferences at any time.`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>New to the platform? Start here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Creating Your Account</h3>
                  <p className="text-muted-foreground text-sm">
                    {`If you're a new member, you'll need to create an account first. Click "Sign Up" and
                  provide your email address and basic information. You'll receive a verification email
                  to activate your account.`}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Completing Your Profile</h3>
                  <p className="text-muted-foreground text-sm">
                    {` After account verification, complete your profile with your professional information,
                  including your school name and position. This information helps us personalize your
                  experience.`}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Exploring Features</h3>
                  <p className="text-muted-foreground text-sm">
                    Once logged in, explore the member dashboard to access conference registration,
                    community blog, file management, and other features available to FPA members.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground text-sm">
                    {`If you encounter any issues or have questions, don't hesitate to reach out to our
                  support team. We're here to help!`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card id="contact-support" className="scroll-mt-20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-6 w-6 text-primary" />
              <CardTitle>Contact Support</CardTitle>
            </div>
            <CardDescription>
              {`Can't find what you're looking for? Our support team is ready to help`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {`Send us an email and we'll get back to you within 24-48 hours.`}
                </p>
                <a
                  href="mailto:support@fijiprincipalsassociation.org.fj"
                  className="text-primary hover:underline"
                >
                  support@fijiprincipalsassociation.org.fj
                </a>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  We aim to respond to all inquiries within 24-48 hours during business days.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Monday - Friday, 9:00 AM - 5:00 PM FJT</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Before Contacting Support</h3>
              <p className="text-muted-foreground text-sm">
                {`Please check our FAQ section above and review the documentation. Many common questions
              can be answered quickly without waiting for a response. If you're reporting a technical
              issue, please include details about your browser, device, and what you were trying to do
              when the issue occurred.`}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Legal & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For information about how we handle your data and our terms of service, please review our
                legal pages.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <a href="/legal">Privacy Policy & Terms</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

