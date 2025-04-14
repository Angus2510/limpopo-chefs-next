"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTermsDialog } from "@/hooks/use-dialog";

export function TermsDialog() {
  const { isOpen, setIsOpen, acceptTerms } = useTermsDialog();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            POPI Act - Privacy Policy & Terms
          </DialogTitle>
          <p className="text-base text-gray-600">
            Please read and accept the privacy policy to continue.
          </p>
        </DialogHeader>

        <div className="relative flex-1 my-4">
          <ScrollArea className="h-[calc(70vh-120px)] sm:h-[calc(60vh-100px)] w-full rounded-md border">
            <div className="p-4 space-y-4">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Management Commitment: Limpopo Chefs Academy has created this
                security & privacy policy in order to demonstrate and
                communicate its commitment to conducting business in accordance
                with the highest legal and ethical standards and appropriate
                internal controls.
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Service inquiries: Our site&apos;s request-for-more-information
                form allows users to give us contact information (like name,
                ID/Passport numbers, email address, and telephone number). This
                information is used to provide information to those who enquire
                about our products and services, to ship orders, and to bill
                orders. This information is also used to get in touch with
                customers when necessary.
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                No personal information will be disclosed to third parties
                without the individual&apos;s permission. However, Limpopo Chefs
                Academy may share personal information: with business partners;
                when we are compelled to do so by law or in terms of a court
                order; if it is in the public interest to do so; or if it is
                necessary to protect our rights.
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Information Capturing: Our site does not currently capture
                information regarding the specific activities of any particular
                user. It does, however, produce reports which allow us to view
                activity in anonymous aggregated form. The only personal
                information we currently capture has been specifically submitted
                to us through the request-for-more-information form.
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Links: This site contains links to other sites. While we try to
                link only to sites that share our high standards and respect
                privacy, our hosting company is not responsible for the security
                or privacy practices of, or the content of, sites other than our
                hosting partner and its subsidiaries. Likewise, our hosting
                partner does not endorse any of the products or services
                marketed at these other sites. We recommend that you always read
                the privacy and security statements on such sites.
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Site Protection: Our site is protected with a variety of
                security measures such as change control procedures, passwords,
                and physical access controls. We also employ a variety of other
                mechanisms to ensure that data you provide is not lost, misused,
                or altered inappropriately. These controls include data
                confidentiality policies and regular database backups.
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Information Removal: If you wish to remove your name and related
                information from our database, we will promptly take action to
                comply with your written request for removal. We will also
                process change requests through any of the following
                communication channels: Sending email to
                info@limpopochefs.co.za.
              </p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Right to amend this privacy and security statement: We reserve
                the right to amend this privacy and security statement at any
                time. All amendments to this privacy and security statement will
                be posted on the website. Unless otherwise stated, the current
                version shall supersede and replace all previous versions of
                this privacy and security statement.
              </p>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="">
          <Button onClick={acceptTerms} className="w-full sm:w-32 mb-4">
            Accept Terms
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TermsDialog;
