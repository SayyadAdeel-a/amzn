import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export const metadata = {
  title: "Privacy Policy | FIFA 2026 Gear",
  description: "Privacy policy and affiliate disclosure for the FIFA 2026 Gear storefront.",
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow py-32 px-4 max-w-3xl mx-auto w-full">
        <article className="prose prose-invert prose-brand max-w-none text-zinc-300 leading-relaxed">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-8">Privacy Policy</h1>
          
          <p className="mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Affiliate Disclosure</h2>
          <p className="mb-6">
            This site (FIFA 2026 Gear) operates as an Amazon Associate. We earn from qualifying purchases. This means that when you click on links to various merchants on this site and make a purchase, this can result in a commission that is credited to this site at no additional cost to you.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Information Collection</h2>
          <p className="mb-6">
            We do not collect personal information or store user data in a database. This is a static storefront designed to showcase trending products. We do not require you to create an account, nor do we collect your email address or payment information. All transactions are securely handled on Amazon.com.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Cookies and Tracking</h2>
          <p className="mb-6">
            As an Amazon Associate, we use standard affiliate tracking links provided by Amazon. When you click an affiliate link and are redirected to Amazon, Amazon may place a cookie on your browser to attribute any resulting sale to our storefront. Please refer to Amazon's Privacy Notice for more information on how they handle cookies and data.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Third-Party Links</h2>
          <p className="mb-6">
            Our website contains links to third-party websites (primarily Amazon). We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party web sites or services.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Contact Us</h2>
          <p className="mb-6">
            If you have any questions about this Privacy Policy, please contact us via our social media channels or through Amazon's customer support regarding your orders.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  )
}
