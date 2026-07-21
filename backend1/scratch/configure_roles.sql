-- Configure roles and permissions
INSERT INTO iam_roles (key, name, description, permissions, is_system, is_default, status)
VALUES
  ('admin', 'Administrateur', 'Acces complet a toute la plateforme', '["*"]', TRUE, FALSE, 'active'),
  ('editor', 'Editeur', 'Gestion des contenus editoriaux (actualites, articles, media)', '["articles.*","media.*","uploads.*","awards.*","hall-of-fame.*","big-moments.*","hero-banners.*"]', TRUE, FALSE, 'active'),
  ('match-builder', 'Generateur de Matchs', 'Gestion de la programmation des matchs, scores, stades et arbitres. Aucun acces aux actualites.', '["matches.*","seasons.*","stadiums.*","referees.*","clubs.view","players.view"]', TRUE, FALSE, 'active'),
  ('user', 'Utilisateur', 'Acces de base en lecture seule', '[]', TRUE, TRUE, 'active')
ON CONFLICT (key) DO UPDATE SET 
  permissions = EXCLUDED.permissions,
  description = EXCLUDED.description;
