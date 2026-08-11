export default {
  async fetch(): Promise<Response> {
    return Response.json({
      ok: true,
      service: 'done-ai-worker',
    });
  },
};
