import service from '../../nasa-service.cjs';
import science from '../../science-service.cjs';

// Only these routes are public; no arbitrary URL proxy or filesystem access.
export const config = { path: ['/api/nasa', '/api/nasa/audit', '/api/moon-tile', '/api/science'] };
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
export default async function handler(request) {
  if (request.method !== 'GET') return Response.json({error:'Método no permitido'}, {status:405,headers:{...headers,Allow:'GET'}});
  const url = new URL(request.url);
  if (url.pathname === '/api/science') {
    try { return Response.json(await science.getScience(),{headers}); }
    catch { return Response.json({error:'Diviner y OSDR no disponibles'},{status:503,headers}); }
  }
  if (url.pathname === '/api/moon-tile') {
    const x=url.searchParams.get('x'), y=url.searchParams.get('y');
    if (!/^\d+$/.test(x ?? '') || !/^\d+$/.test(y ?? '') || Number(x)>=64 || Number(y)>=32)
      return Response.json({error:'Coordenadas de tesela inválidas'}, {status:400,headers});
    try {
      const tile=await service.getTile(Number(x),Number(y));
      return new Response(new Uint8Array(tile),{headers:{'Content-Type':'image/jpeg','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
    } catch {
      return Response.json({error:'Moon Trek no disponible. Reintenta en un momento.'},{status:502,headers});
    }
  }
  if (url.pathname === '/api/nasa/audit') {
    const data=service.getAudit();
    return Response.json(data || {error:'Esta instancia no conserva una consulta anterior. La evidencia de tu misión está en Entorno y conexión NASA y en la respuesta /api/nasa.'},{status:data?200:404,headers});
  }
  if (url.pathname !== '/api/nasa') return Response.json({error:'Ruta no encontrada'},{status:404,headers});
  try {
    return Response.json(await service.getData(process.env.NASA_API_KEY),{headers});
  } catch {
    // Never return upstream exception messages: they could include credentials.
    return Response.json({error:'No se pudo consultar NASA. Reintenta o revisa NASA_API_KEY en Netlify. No se usó un archivo local.'},{status:503,headers});
  }
}
