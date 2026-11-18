// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { fixBlogHeadings } from '../../src/blog.js';

// The Squarespace blog list template renders every post title as an h1 (12 on /blog).
const item = (slug) => `
  <article class="blog-item"><section class="blog-item-summary">
    <h1 class="blog-title" data-x="1"><a href="/blog/${slug}" data-no-animation>Title ${slug}</a></h1>
  </section></article>`;
const list = `<div class="blog-side-by-side-wrapper">${item('a')}${item('b')}${item('c')}</div>`;

describe('fixBlogHeadings', () => {
  beforeEach(() => { document.body.innerHTML = list; });

  it('turns every list title into an h2, keeping its class, attributes and link', () => {
    fixBlogHeadings(document);
    const titles = document.querySelectorAll('.blog-title');
    expect(titles).toHaveLength(3);
    titles.forEach((t) => {
      expect(t.tagName).toBe('H2');
      expect(t.dataset.x).toBe('1');
      expect(t.querySelector('a[data-no-animation]')).not.toBeNull();
    });
    expect(document.querySelector('.blog-title a').getAttribute('href')).toBe('/blog/a');
  });

  it('gives the page exactly one h1, placed before the first post', () => {
    fixBlogHeadings(document);
    const h1s = document.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent.replace(/\s+/g, ' ').trim()).toBe('Music registration, explained.');
    expect(h1s[0].nextElementSibling.matches('article.blog-item')).toBe(true);
  });

  it('is idempotent', () => {
    fixBlogHeadings(document);
    fixBlogHeadings(document);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelectorAll('h2.blog-title')).toHaveLength(3);
  });

  it('adds no h1 when the page already has one', () => {
    document.body.insertAdjacentHTML('afterbegin', '<h1>Existing</h1>');
    fixBlogHeadings(document);
    expect([...document.querySelectorAll('h1')].map((h) => h.textContent)).toEqual(['Existing']);
  });

  it('leaves a single post page alone', () => {
    document.body.innerHTML = '<div class="blog-item-title"><h1 class="entry-title">Post</h1></div>';
    fixBlogHeadings(document);
    expect(document.body.innerHTML).toBe('<div class="blog-item-title"><h1 class="entry-title">Post</h1></div>');
  });
});
