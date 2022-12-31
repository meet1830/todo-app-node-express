const config = {
  headers: {
    "content-type": "application/json",
  },
};


window.onload = function () {
    getProfileDetails();
}

function getProfileDetails() {
    axios
      .post(`/profileDetails`, JSON.stringify({}), config)
      .then((res) => {
        if (res.status !== 200) {
          alert("Failed to Read, Please try again!");
          return;
        }
        console.log(res.data.data[0]);

        const currUser = res.data.data[0];

        document.getElementById("profile-input-name").setAttribute("value", currUser.name);
        document.getElementById("profile-input-username").setAttribute("value", currUser.username);
        document.getElementById("profile-input-phone").setAttribute("value", currUser.phone);
        document.getElementById("profile-input-email").setAttribute("value", currUser.email);

        document.getElementById("profile-input-college").setAttribute("value", currUser.college);
        document.getElementById("profile-input-state").setAttribute("value", currUser.state);
        document.getElementById("profile-input-country").setAttribute("value", currUser.country);

        document.getElementById("profile-span-name").innerText = currUser.name;
        document.getElementById("profile-span-email").innerText = currUser.email;
      })
      .catch((err) => {
        console.log(err);
        alert("Something went wrong!");
      });
  }
  