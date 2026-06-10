export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://dapurrempah.infinityfreeapp.com/resto-api/menus.php"
    );

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    return res.status(response.status).send(text);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}