export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();

        const getRequired = (name) => {
            const value = formData.get(name);

            if (!value || !value.toString().trim()) {
                throw new Error(`Missing required field: ${name}`);
            }

            return value.toString().trim();
        };

        const getOptional = (name) => {
            const value = formData.get(name);
            return value ? value.toString().trim() : "";
        };

        const dogName = getRequired("dog-name");
        const breed = getRequired("breed");
        const age = getRequired("age");
        const weight = getRequired("weight");
        const sex = getRequired("sex");
        const neutered = getRequired("neutered");
        const vaccinations = getRequired("vaccinations");

        const temperament = getRequired("temperament");
        const aggression = getRequired("aggression");
        const aggressionDetails = getOptional("aggression-details");
        const resourceGuarding = getRequired("resource-guarding");
        const resourceDetails = getOptional("resource-details");
        const socialExperience = getRequired("social-experience");
        const additionalInformation = getOptional("additional-information");

        const vet = getRequired("vet");

        const ownerName = getRequired("owner-name");
        const phone = getRequired("phone");
        const address = getRequired("address");
        const heardAboutUs = getRequired("heard-about-us");

        await context.env.DB
            .prepare(`
                INSERT INTO trial_requests (
                    dog_name,
                    breed,
                    age,
                    weight,
                    sex,
                    neutered,
                    vaccinations,
                    temperament,
                    aggression,
                    aggression_details,
                    resource_guarding,
                    resource_details,
                    social_experience,
                    additional_information,
                    vet,
                    owner_name,
                    phone,
                    address,
                    heard_about_us
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                dogName,
                breed,
                age,
                weight,
                sex,
                neutered,
                vaccinations,
                temperament,
                aggression,
                aggressionDetails,
                resourceGuarding,
                resourceDetails,
                socialExperience,
                additionalInformation,
                vet,
                ownerName,
                phone,
                address,
                heardAboutUs
            )
            .run();

            try {

                await context.env.EMAIL.send({

                    to: "campmikeydogdaycare@gmail.com",

                    from: "bookings@campmikey.ie",

                    subject: `New Trial Day Request - ${dogName}`,

                    text: `
            NEW CAMP MIKEY TRIAL DAY REQUEST

            ABOUT THE DOG

            Dog's Name: ${dogName}
            Breed: ${breed}
            Age: ${age}
            Approximate Weight: ${weight}
            Sex: ${sex}
            Spayed / Neutered: ${neutered}
            Vaccinations Up to Date: ${vaccinations}

            PERSONALITY & SOCIAL EXPERIENCE

            Temperament:
            ${temperament}

            Aggression: ${aggression}

            Aggression Details:
            ${aggressionDetails || "None provided"}

            Resource Guarding: ${resourceGuarding}

            Resource Guarding Details:
            ${resourceDetails || "None provided"}

            Off-Lead Social Experience:
            ${socialExperience}

            Additional Information:
            ${additionalInformation || "None provided"}

            OWNER DETAILS

            Owner's Name: ${ownerName}
            Phone Number: ${phone}
            Home Address:
            ${address}

            Preferred Veterinary Practice: ${vet}

            How They Heard About Camp Mikey: ${heardAboutUs}
                `.trim()

            });

        } catch (emailError) {

            console.error(
                "Trial request saved, but email notification failed:",
                emailError
            );

        }

        return Response.redirect(
            new URL("/thanks.html", context.request.url).toString(),
            303
        );

    } catch (error) {

        console.error("Trial request error:", error);

        return new Response(
            "We couldn't submit your trial day request. Please go back and try again.",
            {
                status: 400,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            }
        );
    }
}