interface Values {
  name: string;
  surname: string;
  email: string;
}

export const sendEmail = async (values: Values) => {
  try {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      console.log("Email sent successfully!");
    } else {
      const errorDetails = await response.json();
      console.error("Error sending email:", errorDetails.message);
    }
  } catch (error) {
    console.error("There was a problem sending the email:", error);
  }
};
