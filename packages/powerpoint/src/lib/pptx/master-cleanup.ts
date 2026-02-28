/* global PowerPoint */

export async function cleanupSlideMasters(
  context: PowerPoint.RequestContext,
): Promise<void> {
  const masters = context.presentation.slideMasters;
  const slides = context.presentation.slides;
  masters.load("items");
  slides.load("items");
  await context.sync();

  if (masters.items.length <= 1) return;

  for (const master of masters.items) {
    master.layouts.load("items/name,items/id");
  }
  for (const slide of slides.items) {
    slide.layout.load("name,id");
  }
  await context.sync();

  const primaryLayoutId = slides.items[0].layout.id;
  const primaryMaster = masters.items.find((m) =>
    m.layouts.items.some((l) => l.id === primaryLayoutId),
  );
  if (!primaryMaster) return;

  for (let i = 1; i < slides.items.length; i++) {
    const layoutName = slides.items[i].layout.name;
    const matchingLayout = primaryMaster.layouts.items.find(
      (l) => l.name === layoutName,
    );
    if (matchingLayout) {
      slides.items[i].applyLayout(matchingLayout);
    }
  }
  await context.sync();

  const orphanedMasters = masters.items.filter((m) => m !== primaryMaster);
  for (const master of orphanedMasters) {
    const firstLayout = master.layouts.items[0];
    if (!firstLayout) continue;

    context.presentation.slides.add({ layoutId: firstLayout.id });
    await context.sync();

    const allSlides = context.presentation.slides;
    allSlides.load("items");
    await context.sync();

    allSlides.items[allSlides.items.length - 1].delete();
    await context.sync();
  }
}
