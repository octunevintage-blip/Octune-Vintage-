import Content from '../models/Content.js';

export const getContent = async (req, res) => {
  try {
    let content = await Content.findOne()
      .populate('looks.hotspots.product')
      .populate('upcomingBanner.product')
      .populate('trendingProducts')
      .populate('newArrivals')
      .populate('vintageClassics')
      .populate('archivePicks');
    
    // Create singleton if it doesn't exist
    if (!content) {
      content = await Content.create({});
    }

    // Auto-deactivate expired timer
    if (content.nextDrop && content.nextDrop.isActive && content.nextDrop.targetDate) {
      if (new Date(content.nextDrop.targetDate) <= new Date()) {
        content.nextDrop.isActive = false;
        await content.save();
      }
    }

    res.json(content);
  } catch (error) {
    console.error('Get Content Error:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
};

export const updateContent = async (req, res) => {
  try {
      const { 
        hero, 
        heroBanners, 
        splitBanners, 
        looks, 
        customBanners, 
        upcomingBanner,
        trendingProducts,
        newArrivals,
        vintageClassics,
        archivePicks,
        about,
        terms,
        faqs,
        announcement,
        nextDrop,
        ourPeoples,
        ourPeopleContent,
        sectionHeadings
      } = req.body;
  
      let content = await Content.findOne();
      if (!content) {
        content = new Content();
      }
  
      if (hero) content.hero = hero;
      if (heroBanners) content.heroBanners = heroBanners;
      if (splitBanners) content.splitBanners = splitBanners;
      if (looks) content.looks = looks;
      if (customBanners) content.customBanners = customBanners;
      if (upcomingBanner !== undefined) content.upcomingBanner = upcomingBanner;
      if (trendingProducts) content.trendingProducts = trendingProducts;
      if (newArrivals) content.newArrivals = newArrivals;
      if (vintageClassics) content.vintageClassics = vintageClassics;
      if (archivePicks) content.archivePicks = archivePicks;
      if (about) content.about = about;
      if (terms !== undefined) content.terms = terms;
      if (faqs !== undefined) content.faqs = faqs;
      if (announcement !== undefined) content.announcement = announcement;
      if (nextDrop !== undefined) content.nextDrop = nextDrop;
      if (ourPeoples !== undefined) {
        content.ourPeoples = ourPeoples;
        content.markModified('ourPeoples');
      }
      if (ourPeopleContent !== undefined) {
        content.ourPeopleContent = ourPeopleContent;
        content.markModified('ourPeopleContent');
      }
      if (sectionHeadings !== undefined) {
        content.sectionHeadings = sectionHeadings;
        content.markModified('sectionHeadings');
      }
  
      await content.save();
    
    // Return populated content
    const updatedContent = await Content.findById(content._id)
      .populate('looks.hotspots.product')
      .populate('upcomingBanner.product')
      .populate('trendingProducts')
      .populate('newArrivals')
      .populate('vintageClassics')
      .populate('archivePicks');
    res.json(updatedContent);
  } catch (error) {
    console.error('Update Content Error:', error);
    res.status(500).json({ message: 'Server error updating content' });
  }
};
