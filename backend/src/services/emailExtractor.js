const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extrait les emails d'une page web
 * @param {string} url URL du site web
 * @returns {Promise<string[]>} Liste des emails trouvés
 */
async function extractEmailsFromWebsite(url) {
  try {
    if (!url) {
      return [];
    }

    // Vérifier que l'URL est valide
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Récupérer le contenu de la page
    const response = await axios.get(url, {
      timeout: 10000, // Timeout de 10 secondes
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    
    // Utiliser une expression régulière pour trouver les emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = html.match(emailRegex) || [];
    
    // Filtrer les emails pour éliminer les doublons et les emails invalides
    const uniqueEmails = [...new Set(emails)].filter(email => {
      // Exclure les emails qui contiennent des mots comme "example", "test", etc.
      return !email.includes('example') && 
             !email.includes('test') && 
             !email.includes('your-email') &&
             !email.includes('email@') &&
             !email.includes('user@');
    });

    // Chercher également les emails dans les liens "mailto:"
    const $ = cheerio.load(html);
    $('a[href^="mailto:"]').each((i, element) => {
      const href = $(element).attr('href');
      const email = href.replace('mailto:', '').split('?')[0].trim();
      if (email && !uniqueEmails.includes(email)) {
        uniqueEmails.push(email);
      }
    });

    return uniqueEmails;
  } catch (error) {
    console.error(`Erreur lors de l'extraction des emails depuis ${url}:`, error.message);
    return [];
  }
}

/**
 * Extrait les emails de la page de contact d'un site web
 * @param {string} baseUrl URL du site web
 * @returns {Promise<string[]>} Liste des emails trouvés
 */
async function extractEmailsFromContactPage(baseUrl) {
  try {
    if (!baseUrl) {
      return [];
    }

    // Vérifier que l'URL est valide
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }

    // Supprimer le slash final s'il existe
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    // Liste des chemins possibles pour la page de contact
    const contactPaths = [
      '/contact',
      '/contact-us',
      '/contactez-nous',
      '/nous-contacter',
      '/about',
      '/about-us',
      '/a-propos',
      '/qui-sommes-nous'
    ];

    let allEmails = [];

    // Essayer chaque chemin possible
    for (const path of contactPaths) {
      try {
        const contactUrl = `${baseUrl}${path}`;
        const emails = await extractEmailsFromWebsite(contactUrl);
        allEmails = [...allEmails, ...emails];
      } catch (error) {
        // Ignorer les erreurs et continuer avec le prochain chemin
        console.log(`Impossible d'accéder à ${baseUrl}${path}: ${error.message}`);
      }
    }

    return [...new Set(allEmails)]; // Éliminer les doublons
  } catch (error) {
    console.error(`Erreur lors de l'extraction des emails depuis les pages de contact de ${baseUrl}:`, error.message);
    return [];
  }
}

module.exports = {
  extractEmailsFromWebsite,
  extractEmailsFromContactPage
};
