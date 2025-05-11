import { describe, test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Component from '@/pages/playmats/[id].astro'; // Ajusta la ruta según tu estructura
import { getContainerRenderer } from '@astrojs/react';
import { loadRenderers } from 'astro:container';

test('renderiza el nombre del producto correctamente', async () => {
  const reactRenderer = await getContainerRenderer()
  const renderers = await loadRenderers([reactRenderer]);
  const container = await AstroContainer.create({
    renderers
  });

  const html = await container.renderToString(Component, {
    params: { id: '1' },
  });

  expect(html).toContain('Vitral de Tierras');
  expect(html).toContain('Antideslizante');
  expect(html).toContain('Impermeable');
  expect(html).toContain('Playmats');
  expect(html).toContain('Añadir');
  expect(html).toContain('data-role="image"');
});
