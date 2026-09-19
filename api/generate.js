export default async function handler(req, res) {
  // Sécurité 1 : Bloquer tout ce qui n'est pas une requête POST (envoi de formulaire)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { name, tone, keywords } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // Sécurité 2 : La clé est lue côté serveur, masquée du public

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API manquante sur le serveur Vercel. Ajoutez GEMINI_API_KEY dans vos paramètres." });
  }

  // Configuration du Prompt envoyé à l'IA en tâche de fond
  const prompt = `Tu es un expert en SEO et e-commerce. Rédige une fiche produit hautement persuasive et optimisée pour Google pour le produit suivant :
  Nom du produit : ${name}
  Ton de rédaction : ${tone}
  Mots-clés obligatoires à intégrer : ${keywords}

  Format de réponse : Inclus un titre H1 accrocheur, une introduction captivante, une liste à puces des avantages clients, une section optimisation SEO avec des mots-clés LSI, et 3 hashtags pertinents à la fin. Ne mets aucune introduction de type "Voici votre texte". Rédige en français uniquement.`;

  try {
    // Appel sécurisé à l'API officielle de Google Gemini (modèle 1.5 Flash ultra-rapide)
    const response = await fetch(`https://googleapis.com{apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    // Extraction du texte de la réponse de l'API
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const textGenerated = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: textGenerated });
    } else {
      return res.status(500).json({ error: "L'API Google a renvoyé une structure inattendue." });
    }
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la génération avec l'IA." });
  }
}
