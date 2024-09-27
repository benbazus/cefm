import { Card } from '@/components/ui/card'

export default function PrivacyPolicyPage() {
  return (
    <div className='container mx-auto p-4 md:p-8'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-4 lg:max-w-4xl'>
        <Card className='rounded-md bg-white p-6 shadow-md'>
          <h1 className='mb-4 text-3xl font-semibold tracking-tight text-gray-900'>
            Privacy Policy
          </h1>
          <p className='mb-6 text-sm text-gray-600'>
            This privacy policy explains how we collect, use, and protect your
            personal data.
          </p>
          <div className='terms-of-service prose lg:prose-xl'>
            <p className='text-gray-600'>
              At File Share Manager, we are committed to protecting your privacy
              and ensuring the security of your personal information. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our file-sharing service.
            </p>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              1. Information We Collect
            </h2>
            <p className='text-gray-600'>
              We collect the following types of information:
            </p>
            <ul className='list-disc pl-4 text-gray-600'>
              <li>
                <strong className='text-gray-900'>Personal Information:</strong>{' '}
                This includes your name, email address, and any other
                information you provide when creating an account or using our
                service.
              </li>
              <li>
                <strong className='text-gray-900'>Usage Data:</strong> We
                collect information on how you interact with our service,
                including IP addresses, browser type, pages visited, and time
                spent on the service.
              </li>
              <li>
                <strong className='text-gray-900'>File Data:</strong> We store
                the files you upload to our service, along with metadata such as
                file names and sizes.
              </li>
            </ul>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              2. How We Use Your Information
            </h2>
            <p className='text-gray-600'>
              We use the collected information for various purposes, including:
            </p>
            <ul className='list-disc pl-4 text-gray-600'>
              <li>Providing and maintaining our service</li>
              <li>Notifying you about changes to our service</li>
              <li>
                Allowing you to participate in interactive features when you
                choose to do so
              </li>
              <li>Providing customer support</li>
              <li>
                Gathering analysis or valuable information to improve our
                service
              </li>
              <li>Monitoring the usage of our service</li>
              <li>Detecting, preventing, and addressing technical issues</li>
            </ul>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              3. Data Security
            </h2>
            <p className='text-gray-600'>
              We implement a variety of security measures to maintain the safety
              of your personal information, including:
            </p>
            <ul className='list-disc pl-4 text-gray-600'>
              <li>
                Using encryption to protect sensitive data transmitted to and
                from our site
              </li>
              <li>
                Regularly monitoring our systems for possible vulnerabilities
                and attacks
              </li>
              <li>Using secure cloud storage providers to store your files</li>
              <li>
                Limiting access to your personal information to employees who
                need it to perform their job duties
              </li>
            </ul>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              4. Data Retention
            </h2>
            <p className='text-gray-600'>
              We will retain your personal information and uploaded files only
              for as long as necessary to fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is required or
              permitted by law.
            </p>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              5. Sharing Your Information
            </h2>
            <p className='text-gray-600'>
              We do not sell, trade, or rent your personal identification
              information to others. We may share generic aggregated demographic
              information not linked to any personal identification information
              regarding visitors and users with our business partners, trusted
              affiliates, and advertisers.
            </p>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              6. Third-Party Services
            </h2>
            <p className='text-gray-600'>
              We may employ third-party companies and individuals to facilitate
              our service, provide the service on our behalf, perform
              service-related services, or assist us in analyzing how our
              service is used. These third parties have access to your personal
              information only to perform these tasks on our behalf and are
              obligated not to disclose or use it for any other purpose.
            </p>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              7. Your Data Protection Rights
            </h2>
            <p className='text-gray-600'>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className='list-disc pl-4 text-gray-600'>
              <li>The right to access, update, or delete your information</li>
              <li>The right to rectification</li>
              <li>The right to object to processing</li>
              <li>The right of restriction</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              8. Children's Privacy
            </h2>
            <p className='text-gray-600'>
              Our service does not address anyone under the age of 13. We do not
              knowingly collect personally identifiable information from
              children under 13. If we discover that a child under 13 has
              provided us with personal information, we immediately delete this
              from our servers.
            </p>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              9. Changes to This Privacy Policy
            </h2>
            <p className='text-gray-600'>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last Updated" date at the top of this Privacy
              Policy.
            </p>

            <h2 className='mt-8 text-2xl font-semibold text-gray-900'>
              10. Contact Us
            </h2>
            <p className='text-gray-600'>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <p className='text-gray-600'>File Share Manager Admin</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
