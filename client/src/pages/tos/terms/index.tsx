import { Card } from '@/components/ui/card'

export default function TermsOfServicePage() {
  const currentDate = new Date().toLocaleDateString()

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 lg:max-w-4xl'>
        <Card className='p-6'>
          <h1 className='mb-4 text-3xl font-semibold tracking-tight text-gray-900'>
            Terms of Service
          </h1>
          <p className='mb-6 text-sm text-gray-600'>
            These terms of service outline the agreement between you and our
            company.
          </p>
          <div className='terms-of-service space-y-6 text-gray-800'>
            <h2 className='text-2xl font-semibold'>
              Terms of Service for File Share Manager
            </h2>
            <p>
              <strong>Last Updated:</strong> {currentDate}
            </p>

            <h3 className='mt-4 text-xl font-semibold'>
              1. Acceptance of Terms
            </h3>
            <p>
              By accessing or using File Share Manager (the "Service"), you
              agree to be bound by these Terms of Service ("Terms"). If you
              disagree with any part of the terms, you may not access the
              Service.
            </p>

            <h3 className='mt-4 text-xl font-semibold'>
              2. Description of Service
            </h3>
            <p>
              File Share Manager is a file sharing and storage service that
              allows users to upload, store, send, receive, and share files.
            </p>

            <h3 className='mt-4 text-xl font-semibold'>3. User Accounts</h3>
            <p>
              3.1. You must create an account to use certain features of the
              Service. You are responsible for maintaining the confidentiality
              of your account and password.
            </p>
            <p>
              3.2. You agree to provide accurate, current, and complete
              information during the registration process and to update such
              information to keep it accurate, current, and complete.
            </p>

            <h3 className='mt-4 text-xl font-semibold'>4. User Content</h3>
            <p>
              4.1. You retain full ownership of your content. By uploading
              content to the Service, you grant File Share Manager a worldwide,
              non-exclusive, royalty-free license to use, store, and share the
              content for the purpose of providing and improving the Service.
            </p>
            <p>
              4.2. You are solely responsible for your content and the
              consequences of uploading and sharing it.
            </p>

            <h3 className='mt-4 text-xl font-semibold'>
              5. Acceptable Use Policy
            </h3>
            <p>You agree not to use the Service to:</p>
            <ul className='list-inside list-disc text-gray-600'>
              <li>
                Upload, share, or store any content that is illegal, harmful,
                threatening, abusive, harassing, defamatory, vulgar, obscene, or
                otherwise objectionable.
              </li>
              <li>
                Infringe upon or violate any third party's intellectual property
                rights.
              </li>
              <li>Distribute malware, viruses, or any other malicious code.</li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Service.
              </li>
              <li>
                Attempt to gain unauthorized access to the Service or its
                related systems or networks.
              </li>
            </ul>

            <h3 className='mt-4 text-xl font-semibold'>
              6. Copyright and DMCA Policy
            </h3>
            <p>
              6.1. We respect the intellectual property rights of others and
              expect users to do the same.
            </p>
            <p>
              6.2. We will respond to notices of alleged copyright infringement
              that comply with applicable law and are properly provided to us.
            </p>
            <p>6.3. [Include detailed DMCA takedown procedure]</p>

            <h3 className='mt-4 text-xl font-semibold'>7. Privacy Policy</h3>
            <p>
              Your use of the Service is also governed by our Privacy Policy,
              which can be found at [link to Privacy Policy].
            </p>

            <h3 className='mt-4 text-xl font-semibold'>8. Termination</h3>
            <p>
              8.1. We may terminate or suspend access to our Service
              immediately, without prior notice or liability, for any reason
              whatsoever, including without limitation if you breach the Terms.
            </p>

            <h3 className='mt-4 text-xl font-semibold'>9. Indemnification</h3>
            <p>
              You agree to defend, indemnify, and hold harmless File Share
              Manager and its licensors, employees, contractors, and agents from
              any claims or damages resulting from your use of the Service or
              breach of these Terms.
            </p>

            <h3 className='mt-4 text-xl font-semibold'>
              10. Limitation of Liability
            </h3>
            <p>
              In no event shall File Share Manager be liable for indirect,
              incidental, or consequential damages resulting from your use of
              the Service.
            </p>

            <h3 className='mt-4 text-xl font-semibold'>11. Governing Law</h3>
            <p>These Terms are governed by the laws of [Your Country/State].</p>

            <h3 className='mt-4 text-xl font-semibold'>12. Changes to Terms</h3>
            <p>
              We reserve the right to modify or replace these Terms at any time.
              Material changes will be notified with at least 30 days' notice.
            </p>

            <h3 className='mt-4 text-xl font-semibold'>13. Contact Us</h3>
            <p>
              If you have any questions about these Terms, contact us at
              files-share@fileShare.com.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
