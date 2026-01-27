import { PUBLIC_WORDPRESS_API_URL } from "@/types/navigation";

export async function navQuery() {
  try {
    const apiUrl =
      PUBLIC_WORDPRESS_API_URL ||
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
      (node) => node.parentId === null
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
      PUBLIC_WORDPRESS_API_URL ||
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
      PUBLIC_WORDPRESS_API_URL ||
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
          error.message
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
    PUBLIC_WORDPRESS_API_URL ||
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
    PUBLIC_WORDPRESS_API_URL ||
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
    PUBLIC_WORDPRESS_API_URL ||
    "https://citizenlab.africtivistes.org/senegal/graphql";

  if (!apiUrl) {
    console.warn(
      "PUBLIC_WORDPRESS_API_URL is not defined, returning empty array"
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
