-- Uses CANCELLED only after 20261003120000_student_cancelled_replace_dropped committed it.

UPDATE "Student"
SET status = 'CANCELLED'
WHERE status = 'DROPPED';
