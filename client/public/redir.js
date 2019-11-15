function isOfDomain(googleUser) {
    var profile = googleUser.getBasicProfile();
    return profile.getEmail().includes("wayland.k12.ma.us")
}