async function test() {
  const payload = {
    name: "coton sport de garoua",
    nickname: "cotonier",
    city: "Garoua",
    region: "Nord",
    foundedYear: 1956,
    websiteUrl: "",
    logoUrl: "",
    bannerUrl: "",
    videoUrl: "",
    primaryColor: "#e4e3dd",
    secondaryColor: "#007a5e",
    stadium: "",
    stadiumCapacity: null,
    stadiumPhotoUrl: "",
    description: "",
    history: "",
    palmares: [],
    presidentName: "",
    presidentPhotoUrl: "",
    budget: null,
    achievements: { league: 0, cup: 0, regional: 0, african: 0 },
    socialMedia: { twitter: "", instagram: "", facebook: "", youtube: "", tiktok: "" },
    status: "ACTIVE"
  };

  try {
    const res = await fetch('http://localhost:3000/api/v1/clubs/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
