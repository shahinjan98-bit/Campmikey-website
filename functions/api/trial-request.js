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

            const emailResponse = await context.env.EMAIL_WORKER.fetch(
                "https://camp-mikey-email.internal",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
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
                    })
                }
            );

            if (!emailResponse.ok) {
                console.error(
                    "Trial request saved, but email Worker returned:",
                    emailResponse.status
                );
            }

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