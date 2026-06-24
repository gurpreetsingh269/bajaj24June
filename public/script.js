async function submitData() {

    let arr = document.getElementById("input")
        .value
        .split("\n")
        .map(x => x.trim())
        .filter(x => x !== "");

    try {

        let response = await fetch("/bfhl", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                data: arr
            })

        });

        let data = await response.json();

        document.getElementById("result").innerText =
            JSON.stringify(data, null, 2);

    }

    catch (err) {

        document.getElementById("result").innerText =
            "Error connecting to API";

    }
}