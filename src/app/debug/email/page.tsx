'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  createWelcomeEmail,
  createPasswordResetEmail,
  createConferenceInvitationEmail,
  createNotificationEmail,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type ConferenceInvitationEmailData,
  type NotificationEmailData
} from '~/lib/email-templates';

// Sample data for testing
const sampleWelcomeData: WelcomeEmailData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  loginUrl: 'https://fijiprinciples.org/login'
};

const samplePasswordResetData: PasswordResetEmailData = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  resetUrl: 'https://fijiprinciples.org/reset-password?token=abc123',
  expiresIn: '24 hours'
};

const sampleConferenceData: ConferenceInvitationEmailData = {
  name: 'Dr. Michael Johnson',
  email: 'michael.johnson@example.com',
  conferenceName: 'Fiji Principles Annual Conference 2024',
  conferenceDate: 'March 15-17, 2024',
  registrationUrl: 'https://fijiprinciples.org/conference/register'
};

const sampleNotificationData: NotificationEmailData = {
  name: 'Sarah Wilson',
  email: 'sarah.wilson@example.com',
  title: 'New Resource Available',
  message: 'We have added a new research paper to our member resources. This comprehensive study covers the latest developments in sustainable practices and is now available in your dashboard.',
  actionUrl: 'https://fijiprinciples.org/resources',
  actionText: 'View Resources'
};

export default function EmailDebugPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');

  const templates = [
    { id: 'welcome', name: 'Welcome Email', data: sampleWelcomeData },
    { id: 'password-reset', name: 'Password Reset', data: samplePasswordResetData },
    { id: 'conference', name: 'Conference Invitation', data: sampleConferenceData },
    { id: 'notification', name: 'Notification', data: sampleNotificationData },
  ];

  const getEmailTemplate = (templateId: string) => {
    switch (templateId) {
      case 'welcome':
        return createWelcomeEmail(sampleWelcomeData);
      case 'password-reset':
        return createPasswordResetEmail(samplePasswordResetData);
      case 'conference':
        return createConferenceInvitationEmail(sampleConferenceData);
      case 'notification':
        return createNotificationEmail(sampleNotificationData);
      default:
        return createWelcomeEmail(sampleWelcomeData);
    }
  };

  const currentTemplate = getEmailTemplate(selectedTemplate);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Template Debug</h1>
        <p className="text-muted-foreground">
          Preview and test email templates for Fiji Principles association
        </p>
        <Badge variant="secondary" className="mt-2">
          Development Only
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {template.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Email Preview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {templates.find(t => t.id === selectedTemplate)?.name} Preview
                <Badge variant="outline">
                  {currentTemplate.subject}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="html">HTML Version</TabsTrigger>
                  <TabsTrigger value="text">Text Version</TabsTrigger>
                </TabsList>

                <TabsContent value="html" className="mt-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">HTML Email Preview</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newWindow = window.open('', '_blank');
                          if (newWindow) {
                            newWindow.document.write(currentTemplate.html);
                            newWindow.document.close();
                          }
                        }}
                      >
                        Open in New Tab
                      </Button>
                    </div>
                    <div
                      className="border rounded p-4 max-h-96 overflow-auto"
                      dangerouslySetInnerHTML={{ __html: currentTemplate.html }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold mb-4">Plain Text Email</h3>
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border max-h-96 overflow-auto">
                      {currentTemplate.text}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sample Data Display */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Sample Data Used</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(templates.find(t => t.id === selectedTemplate)?.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
