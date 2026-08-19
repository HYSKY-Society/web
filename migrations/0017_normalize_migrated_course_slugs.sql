-- Correct historical Mighty Networks course identifiers in pending migrations.
UPDATE pending_tiers
SET course_slugs = replace(
  replace(course_slugs, 'hydrogen-safety-aviation', 'h2-safety-for-aviation'),
  'h2-aviation-policy-power', 'h2-aviation-policy'
)
WHERE course_slugs LIKE '%hydrogen-safety-aviation%'
   OR course_slugs LIKE '%h2-aviation-policy-power%';

-- Correct purchases already transferred to members who signed in.
-- If both the legacy and canonical rows exist, keep the canonical row.
DELETE FROM course_purchases legacy
USING course_purchases canonical
WHERE legacy.user_id = canonical.user_id
  AND (
    (legacy.course_slug = 'hydrogen-safety-aviation' AND canonical.course_slug = 'h2-safety-for-aviation')
    OR
    (legacy.course_slug = 'h2-aviation-policy-power' AND canonical.course_slug = 'h2-aviation-policy')
  );

UPDATE course_purchases
SET course_slug = CASE course_slug
  WHEN 'hydrogen-safety-aviation' THEN 'h2-safety-for-aviation'
  WHEN 'h2-aviation-policy-power' THEN 'h2-aviation-policy'
  ELSE course_slug
END
WHERE course_slug IN ('hydrogen-safety-aviation', 'h2-aviation-policy-power');


