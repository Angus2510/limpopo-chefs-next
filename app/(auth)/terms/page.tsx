"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const Terms = () => {
  const router = useRouter();
  interface User {
    userType?: string;
    // Add other user properties if needed
  }

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Fetch the session on component mount
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");

        if (!res.ok) {
          throw new Error("No valid session found");
        }

        const data = await res.json();
        setUser(data.user);
        setLoading(false);
      } catch {
        setError("You must be logged in to view this page.");
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const acceptAgreement = () => {
    if (!user) {
      setError("No user session found.");
      return;
    }

    const userType = user.userType?.trim().toLowerCase(); // Process userType and ensure it's valid
    console.log("Processed userType:", userType);

    if (!userType) {
      setError("User type is missing or invalid.");
      router.push("/auth/disabled"); // Redirect to disabled page if userType is invalid
      return;
    }

    // Switch based on the user type and navigate to the appropriate dashboard
    switch (userType) {
      case "student":
        console.log("Redirecting to student dashboard");
        router.push("/student/dashboard");
        break;
      case "staff":
        console.log("Redirecting to staff dashboard");
        router.push("/dashboard/admin");
        break;
      case "guardian":
        console.log("Redirecting to guardian dashboard");
        router.push("/guardian/dashboard");
        break;
      default:
        setError("User type not recognised.");
        router.push("/auth/disabled");
        break;
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        {/* Logo */}
        <Image
          src="/img/logo.png"
          width={250}
          height={250}
          alt="logo"
          className="mx-auto mb-16"
        />

        {/* Text */}
        <div className="mb-8 text-center">
          <h4 className="mb-2.5 text-4xl font-bold text-primary-500 dark:text-white">
            POPI ACT
          </h4>
          <p className="mb-9 ml-1 text-base text-gray-600">
            Please read and accept the privacy policy to continue.
          </p>
        </div>

        {/* Terms and conditions content */}
        <div className="h-[30vh] space-y-6 overflow-y-auto">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Management Commitment: Limpopo Chefs Academy has created this
            security & privacy policy to demonstrate and communicate its
            commitment to conducting business in accordance with the highest
            legal and ethical standards and appropriate internal controls.
          </p>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Service inquiries: Our site’s request-for-more-information form
            allows users to give us contact information (like name, ID/Passport
            numbers, email address, and telephone number). This information is
            used to provide information to those who enquire about our products
            and services, to ship orders, and to bill orders. This information
            is also used to get in touch with customers when necessary.
          </p>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            No personal information will be disclosed to third parties without
            the individual’s permission. However, Limpopo Chefs Academy may
            share personal information: with business partners; when we are
            compelled to do so by law or in terms of a court order; if it is in
            the public interest to do so; or if it is necessary to protect our
            rights.
          </p>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Information Capturing: Our site does not currently capture
            information regarding the specific activities of any particular
            user. It does, however, produce reports which allow us to view
            activity in anonymous aggregated form. The only personal information
            we currently capture has been specifically submitted to us through
            the request-for-more- information form.
          </p>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Links: This site contains links to other sites. While we try to link
            only to sites that share our high standards and respect privacy, our
            hosting company is not responsible for the security or privacy
            practices of, or the content of, sites other than our hosting
            partner and its subsidiaries. Likewise, our hosting partner does not
            endorse any of the products or services marketed at these other
            sites. We recommend that you always read the privacy and security
            statements on such sites.
          </p>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Site Protection: Our site is protected with a variety of security
            measures such as change control procedures, passwords, and physical
            access controls. We also employ a variety of other mechanisms to
            ensure that data you provide is not lost, misused, or altered
            inappropriately. These controls include data confidentiality
            policies and regular database backups.
          </p>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Information Removal: If you wish to remove your name and related
            information from our database, we will promptly take action to
            comply with your written request for removal. We will also process
            change requests through any of the following communication channels:
            Sending email to info@limpopochefs.co.za.
          </p>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Right to amend this privacy and security statement: We reserve the
            right to amend this privacy and security statement at any time. All
            amendments to this privacy and security statement will be posted on
            the website. Unless otherwise stated, the current version shall
            supersede and replace all previous versions of this privacy and
            security statement.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If you have any questions about this privacy and security statement,
            or the practices of this site, please email us on
            info@limpopochefs.co.za.
          </p>
        </div>

        {/* Checkbox and Error Message */}
        <div className="mt-6 flex items-center space-x-2">
          <input
            type="checkbox"
            id="popiConsent"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="size-4"
          />
          <label htmlFor="popiConsent" className="text-sm text-gray-600">
            POPI Act Consent
          </label>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {/* Accept Button */}
        <Button
          className="mt-6 w-full"
          onClick={acceptAgreement}
          disabled={!isChecked}
        >
          Accept
        </Button>
      </div>
    </div>
  );
};

export default Terms;
