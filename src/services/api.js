export async function navQuery() {
  try {
    const apiUrl =
      import.meta.env.PUBLIC_WORDPRESS_API_URL ||
      "https://citizenlab.africtivistes.org/senegal/graphql";
    console.log("Fetching menu from:", apiUrl);

    // Créer un AbortController pour gérer le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes de timeout

    const response = await fetch(apiUrl, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
              menuItems(where: {location: HEADER_MENU}) {
                nodes {
                  text: label
                  parentId
                  href: uri
                  childItems {
                    nodes {
                      text: label
                      href: uri
                    }
                  }
                }
              }
            }
            `,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log("API Response:", json);
    const { data } = json;
    console.log("Menu Data:", data);

    if (!data || !data.menuItems || !Array.isArray(data.menuItems.nodes)) {
      console.error("Menu data is missing or malformed:", data);
      return getDefaultMenu();
    }

    const menuItems = data.menuItems.nodes.filter(
      (node) => node.parentId === null,
    );
    console.log("Filtered Menu Items:", menuItems);
    return menuItems;
  } catch (error) {
    console.error("Error fetching menu:", error.message);
    return getDefaultMenu();
  }
}

// Menu par défaut en cas d'erreur
function getDefaultMenu() {
  return [
    {
      text: "Accueil",
      parentId: null,
      href: "/",
      childItems: { nodes: [] },
    },
    {
      text: "FAQ",
      parentId: null,
      href: "/faq",
      childItems: { nodes: [] },
    },
    {
      text: "Contact",
      parentId: null,
      href: "/contact",
      childItems: { nodes: [] },
    },
  ];
}

export async function getNodeByURI(uri) {
  try {
    const apiUrl =
      import.meta.env.PUBLIC_WORDPRESS_API_URL ||
      "https://citizenlab.africtivistes.org/senegal/graphql";

    // Créer un AbortController pour gérer le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes de timeout

    const response = await fetch(apiUrl, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query GetNodeByURI($uri: String!) {
                  nodeByUri(uri: $uri) {
                    __typename
                    isContentNode
                    isTermNode
                    ... on Post {
                      id
                      title
                      date
                      permalink: uri
                      excerpt
                      content
                      categories {
                        nodes {
                          name
                          permalink: uri
                          slug
                        }
                      }
                      terms {
                        nodes {
                          name
                          slug
                          permalink:uri
                        }
                      }
                      featuredImage {
                        node {
                          srcSet
                          sourceUrl
                          altText
                          mediaDetails {
                            height
                            width
                          }
                        }
                      }
                    }
                    ... on Page {
                      id
                      title
                      permalink: uri
                      date
                      content
                      featuredImage {
                        node {
                          srcSet
                          sourceUrl
                          altText
                          mediaDetails {
                            height
                            width
                          }
                        }
                      }
                    }
                    ... on Category {
                      id
                      name
                      posts {
                        nodes {
                          date
                          title
                          excerpt
                          content
                          permalink: uri
                          categories {
                            nodes {
                              name
                              permalink: uri
                            }
                          }
                          featuredImage {
                            node {
                              srcSet
                              sourceUrl
                              altText
                              mediaDetails {
                                height
                                width
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              `,
        variables: {
          uri: uri,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching node by URI ${uri}:`, error.message);
    return null;
  }
}
export async function getAllUris() {
  try {
    const apiUrl =
      import.meta.env.PUBLIC_WORDPRESS_API_URL ||
      "https://citizenlab.africtivistes.org/senegal/graphql";

    let allUris = [];
    let afterCursor = null;
    let hasNextPage = true;
    let maxAttempts = 3; // Nombre maximum de tentatives
    let attempt = 0;

    while (hasNextPage && attempt < maxAttempts) {
      try {
        // Créer un AbortController pour gérer le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes de timeout

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query GetAllUris($after: String) {
          posts(first: 50, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              uri
            }
          }
          pages {
            nodes {
              uri
            }
          }
        }`,
            variables: { after: afterCursor },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();
        const postsData = data?.posts;
        const pagesData = data?.pages?.nodes || [];

        if (postsData) {
          allUris = [...allUris, ...postsData.nodes, ...pagesData];
          hasNextPage = postsData.pageInfo.hasNextPage;
          afterCursor = postsData.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }

        // Réinitialiser le compteur de tentatives en cas de succès
        attempt = 0;
      } catch (error) {
        console.error(
          `Error fetching URIs (attempt ${attempt + 1}/${maxAttempts}):`,
          error.message,
        );
        attempt++;

        // Attendre avant de réessayer
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // Si nous avons des URIs, les nettoyer et les retourner
    if (allUris.length > 0) {
      return allUris
        .filter((node) => node.uri !== null)
        .map((node) => {
          let trimmedURI = node.uri.substring(1);
          trimmedURI = trimmedURI.substring(0, trimmedURI.length - 1);
          return {
            params: {
              uri: decodeURI(trimmedURI),
            },
          };
        });
    }

    // Retourner un tableau par défaut si aucune URI n'est trouvée
    return [{ params: { uri: "faq" } }, { params: { uri: "contact" } }];
  } catch (error) {
    console.error("Error in getAllUris:", error.message);
    // Retourner un tableau par défaut en cas d'erreur
    return [{ params: { uri: "faq" } }, { params: { uri: "contact" } }];
  }
}

export async function findLatestPostsAPI() {
  const apiUrl =
    import.meta.env.PUBLIC_WORDPRESS_API_URL ||
    "https://citizenlab.africtivistes.org/senegal/graphql";

  try {
    // Créer un AbortController pour gérer le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout

    const response = await fetch(apiUrl, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
                    posts(first: 8) {
                      nodes {
                        date
                        permalink: uri
                        title
                        categories {
                          nodes {
                            name
                            permalink: uri
                          }
                        }
                        terms {
                          nodes {
                            name
                            slug
                          }
                        }
                        commentCount
                        excerpt
                        content
                        featuredImage {
                          node {
                            mediaItemUrl
                            altText
                          }
                        }
                      }
                    }
                  }
                `,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching latest posts:", error.message);
    // Retourner des données de démonstration en cas d'erreur
    return [
      {
        date: new Date().toISOString(),
        permalink: "/blog/actualites-citizenlab",
        title: "Actualités CitizenLab Sénégal",
        excerpt:
          "Découvrez les dernières actualités et activités de CitizenLab Sénégal...",
        featuredImage: {
          node: {
            mediaItemUrl: "/assets/images/formation1.jpg",
            altText: "Formation CitizenLab",
          },
        },
        categories: {
          nodes: [{ name: "Actualités", permalink: "/category/actualites" }],
        },
      },
      {
        date: new Date(Date.now() - 86400000).toISOString(),
        permalink: "/blog/participation-citoyenne",
        title: "La Participation Citoyenne au Sénégal",
        excerpt:
          "Comment encourager et développer la participation citoyenne dans notre pays...",
        featuredImage: {
          node: {
            mediaItemUrl: "/assets/images/hero.png",
            altText: "Participation citoyenne",
          },
        },
        categories: {
          nodes: [{ name: "Démocratie", permalink: "/category/democratie" }],
        },
      },
    ];
  }
}
export async function newsPagePostsQuery() {
  const apiUrl =
    import.meta.env.PUBLIC_WORDPRESS_API_URL ||
    "https://citizenlab.africtivistes.org/senegal/graphql";

  try {
    let allPosts = [];
    let afterCursor = null;
    let hasNextPage = true;

    while (hasNextPage) {
      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes de timeout

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query Posts( $after: String) {
              posts(first: 50, after: $after) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  date
                  permalink: uri
                  title
                  commentCount
                  excerpt
                  content
                  categories {
                    nodes {
                      name
                      permalink: uri
                    }
                  }
                  terms {
                    nodes {
                      name
                      slug
                      permalink: uri
                    }
                  }
                  featuredImage {
                    node {
                      mediaItemUrl
                      altText
                    }
                  }
                }
              }
            }
          `,
          variables: { after: afterCursor },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();
      const postsData = data?.posts;

      if (postsData) {
        allPosts = [...allPosts, ...postsData.nodes]; // Ajouter les nouveaux posts à la liste
        hasNextPage = postsData.pageInfo.hasNextPage;
        afterCursor = postsData.pageInfo.endCursor;
      } else {
        hasNextPage = false; // Arrêter en cas d'erreur
      }
    }

    return allPosts;
  } catch (error) {
    console.error("Error fetching news posts:", error.message);
    // Retourner des données de démonstration en cas d'erreur
    return [
      {
        date: new Date().toISOString(),
        permalink: "/blog/actualites-citizenlab",
        title: "Actualités CitizenLab Sénégal",
        excerpt:
          "Découvrez les dernières actualités et activités de CitizenLab Sénégal...",
        featuredImage: {
          node: {
            mediaItemUrl: "/assets/images/formation1.jpg",
            altText: "Formation CitizenLab",
          },
        },
        categories: {
          nodes: [{ name: "Actualités", permalink: "/category/actualites" }],
        },
      },
    ];
  }
}

export async function getAllMembers() {
  const apiUrl =
    import.meta.env.PUBLIC_WORDPRESS_API_URL2 ||
    "https://citizenlab.africtivistes.org/senegal/graphql";

  if (!apiUrl) {
    console.warn(
      "PUBLIC_WORDPRESS_API_URL is not defined, returning empty array",
    );
    return [];
  }

  try {
    const response = await fetch(apiUrl, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          equipes (where: {status: PUBLISH}, first: 100) {
                  nodes {
                        featuredImage {
                              node {
                                altText
                                mediaItemUrl
                        }
                        }
                        title
                        fonctions {
                          equipe
                          fonction
                        }
                        social {
                          facebook
                          instagram
                          linkedin
                          twitter
                        }
                    }
          }
          }     
        `,
      }),
    });

    const { data } = await response.json();

    // Check if data.equipes exists and has nodes
    if (data && data.equipes && data.equipes.nodes) {
      return data.equipes.nodes;
    } else {
      console.error("No equipes data found in API response");
      // Return an empty array as fallback
      return [];
    }
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

export async function getActualitesPosts() {
  const query = `
    query GetActualitesPosts {
      posts(
        where: {
          categoryName: "Actualites"
        }
        first: 20
      ) {
        nodes {
          id
          title
          excerpt
          content
          date
          slug
          content
          categories {
            nodes {
              name
            }
          }
          featuredImage {
            node {
              mediaItemUrl
            }
          }
        }
      }
    }
  `;

  const res = await fetch(import.meta.env.PUBLIC_WP_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  return json.data.posts.nodes;
}

export async function getPodcastPosts() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;

  if (!apiUrl) {
    console.warn("PUBLIC_WORDPRESS_API_URL is not defined");
    return [];
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query PodcastPosts {
          posts(
            where: { categoryName: "Podcasts" }
            first: 20
          ) {
            nodes {
              id
              slug
              title
              excerpt
              content 
              date
              permalink: uri
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              } 
              categories {
                nodes {
                  name
                  slug
                }
              }
            }
          }
        }
      `,
    }),
  });

  const { data } = await response.json();
  return data?.posts?.nodes || [];
}

export async function getLatestActualites(limit = 3) {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;

  if (!apiUrl) return [];

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetLatestActualites($limit: Int!) {
          posts(
            first: $limit
            where: {
              categoryName: "Actualites"
              orderby: { field: DATE, order: DESC }
            }
          ) {
            nodes {
              title
              excerpt
              content
              slug
              uri
              date
              categories {
                nodes {
                  name
                  slug
                }
              }
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              }
            }
          }
        }
      `,
      variables: { limit },
    }),
  });

  const { data } = await response.json();
  return data?.posts?.nodes ?? [];
}
export function extractAudioUrl(postContent) {
  if (!postContent) return "";

  // On récupère le bloc <audio> ou <figure class="wp-block-audio">
  const match = postContent.match(/<audio[\s\S]*?<\/audio>/);
  if (match) return match[0];

  // Si le thème utilise wp-block-audio
  const wpAudioMatch = postContent.match(
    /<figure class="wp-block-audio"[\s\S]*?<\/figure>/,
  );
  if (wpAudioMatch) return wpAudioMatch[0];

  return "";
}

export async function getAllActualites() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL2;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetAllActualites {
          posts(
            where: { categoryName: "Actualites" }
            first: 100
          ) {
            nodes {
              title
              content
              excerpt
              slug
              uri
              date
              categories {
                nodes {
                  name
                  slug
                }
              }
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              }
            }
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return data?.posts?.nodes ?? [];
}

export async function getAllFormations() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetAllFormations {
          posts(
            where: { categoryName: "Formations", status: PUBLISH }
            first: 100
          ) {
            nodes {
              slug
              formation {
                nom
                description
                lieu
                date
                prix
                statut
                duree
                formateur
                profession
                places
                lien {
                  url
                  title
                  target
                }
              }
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              }    
            }
          }
        }
      `,
    }),
  });

  const json = await response.json();
  console.log("GRAPHQL:", json);

  return json?.data?.posts?.nodes ?? [];
}

export async function getNextFormation() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetNextFormation {
          posts(
            where: {
              categoryName: "Formations"
              status: PUBLISH
            }
            first: 50
          ) {
            nodes {
              slug
              formation {
                nom
                description
                lieu
                date
                prix
                statut
                duree
                formateur
                profession
                places
                lien {
                  url
                  title
                  target
                }
              }
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              }
            }
          }
        }
      `,
    }),
  });

  const json = await response.json();
  console.log("GRAPHQL:", json);

  const formations = json?.data?.posts?.nodes ?? [];

  // Filtrer les formations avec le statut "À venir"
  const formationsAvenir = formations
    .filter((formation) => {
      const statut = formation.formation?.statut;
      // Vérifier si c'est un tableau qui contient "À venir"
      if (Array.isArray(statut)) {
        return statut.includes("À venir");
      }
      // Sinon vérifier si c'est une chaîne égale à "À venir"
      return statut === "À venir";
    })
    .sort((a, b) => {
      // Trier par date croissante (la plus proche en premier)
      const dateA = new Date(a.formation.date);
      const dateB = new Date(b.formation.date);
      return dateA - dateB;
    });

  console.log("Formations à venir trouvées:", formationsAvenir.length);

  // Retourner la première formation (la prochaine)
  return formationsAvenir[0] ?? null;
}

export async function getAllMagazines() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetAllMagazines {
          posts(
            where: { categoryName: "Magazine", status: PUBLISH }
            first: 100
          ) {
            nodes {
              slug
              magazine {
                titre
                description
                date
                fichier {
                  node {
                    mediaItemUrl
                    altText
                  }
                }
              }
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              }    
            }
          }
        }
      `,
    }),
  });

  const json = await response.json();
  console.log("GRAPHQL:", json);

  return json?.data?.posts?.nodes ?? [];
}

export async function getAllPodcast() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;
  if (!apiUrl) return [];

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query PodcastPosts {
          posts(where: { categoryName: "Podcast" }, first: 20) {
            nodes {
              id
              slug
              title
              excerpt
              content
              date
              uri
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              }
              categories {
                nodes {
                  name
                  slug
                }
              }
              podcast {
                type
              }  
            }
          }
        }
      `,
    }),
  });

  const json = await response.json();
  console.log("GRAPHQL PODCAST:", json);

  return json?.data?.posts?.nodes ?? [];
}

export function extractVideoUrl(postContent) {
  if (!postContent) return "";

  // <video> natif
  const match = postContent.match(/<video[\s\S]*?<\/video>/);
  if (match) return match[0];

  // Bloc Gutenberg wp-block-video
  const wpVideoMatch = postContent.match(
    /<figure class="wp-block-video"[\s\S]*?<\/figure>/,
  );
  if (wpVideoMatch) return wpVideoMatch[0];

  return "";
}

export async function getAllVideos() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetAllVideos {
          posts(
            where: { categoryName: "Videos" }
            first: 100
          ) {
            nodes {
              title
              excerpt
              content
              slug
              uri
              date
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              }
            }
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return data?.posts?.nodes ?? [];
}
export async function getAllRealisations() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;

  if (!apiUrl) {
    console.warn("PUBLIC_WORDPRESS_API_URL is not defined");
    return [];
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetRealisations {
            posts(
              where: { categoryName: "Realisations" }
              first: 50
            ) {
              nodes {
                id
                title
                content
                excerpt
                date
                slug
                featuredImage {
                  node {
                    mediaItemUrl
                    altText
                  }
                }
              }
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return [];
    }

    return result.data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching Realisations:", error);
    return [];
  }
}
export async function getRealisationBySlug(slug) {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;

  if (!apiUrl) {
    console.warn("PUBLIC_WORDPRESS_API_URL is not defined");
    return null;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetRealisationBySlug($slug: ID!) {
            post(id: $slug, idType: SLUG) {
              id
              title
              excerpt
              content
              date
              slug
              uri
              categories {
                nodes {
                  name
                  slug
                }
              }
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                  srcSet
                  sourceUrl
                  mediaDetails {
                    height
                    width
                  }
                }
              }
            }
          }
        `,
        variables: { slug },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    return result.data?.post || null;
  } catch (error) {
    console.error("Error fetching Realisation:", error);
    return null;
  }
}
// Fonction pour récupérer tous les projets
export async function getAllProjets() {
  const apiUrl = import.meta.env.PUBLIC_WORDPRESS_API_URL;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetAllProjets {
          posts(
            where: { categoryName: "projets" }
            first: 100
          ) {
            nodes {
              title
              excerpt
              content
              slug
              uri
              date
              categories {
                nodes {
                  name
                  slug
                }
              }
              featuredImage {
                node {
                  mediaItemUrl
                  altText
                }
              }
            }
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return data?.posts?.nodes ?? [];
}
