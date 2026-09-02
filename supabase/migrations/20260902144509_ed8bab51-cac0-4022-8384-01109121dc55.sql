REVOKE ALL ON FUNCTION public.run_production(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.issue_requisition(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.run_production(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_requisition(uuid) TO authenticated;