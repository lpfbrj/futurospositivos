
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { MapPage } from './components/MapPage';
import { InitiativesPage } from './components/InitiativesPage';
import { InitiativeDetailsPage } from './components/InitiativeDetailsPage';
import { ForumPage } from './components/ForumPage';
import { ForumCategoryViewPage } from './components/ForumCategoryViewPage';
import { CreateTopicModal } from './components/CreateTopicModal';
import { CreateInitiativeModal, CreateInitiativeFormData } from './components/CreateInitiativeModal';
import { LoginPage } from './components/LoginPage'; 
import { FilterButtons } from './components/FilterButtons';
import { Page, Initiative, InitiativeCategory, ForumItemData, ForumTopic } from './types';
import { INITIAL_INITIATIVES_DATA, ALL_FORUM_TOPICS as INITIAL_FORUM_TOPICS, FORUM_CATEGORY_VIEW_SIDEBAR_TAGS, FORUM_POPUP_DATA } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.MAP);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [allInitiatives, setAllInitiatives] = useState<Initiative[]>(INITIAL_INITIATIVES_DATA);
  const [mapFilter, setMapFilter] = useState<InitiativeCategory | 'all'>(InitiativeCategory.COLETIVO);
  const [isForumPreviewOpen, setIsForumPreviewOpen] = useState(false);
  const [selectedForumCategory, setSelectedForumCategory] = useState<ForumItemData | null>(null);
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [allForumTopics, setAllForumTopics] = useState<ForumTopic[]>(INITIAL_FORUM_TOPICS);
  const [isCreateInitiativeModalOpen, setIsCreateInitiativeModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Re-added for Login Modal

  const handleNavigate = useCallback((page: Page, initiative?: Initiative) => {
    setCurrentPage(page);
    if (initiative) {
      setSelectedInitiative(initiative);
    } else if (page !== Page.INITIATIVE_DETAILS) {
      setSelectedInitiative(null);
    }
    
    if (page !== Page.FORUM || (page === Page.FORUM && !selectedForumCategory)) {
        setSelectedForumCategory(null);
    }

    // Close modals on any main page navigation
    setIsForumPreviewOpen(false); 
    setIsCreateTopicModalOpen(false);
    setIsCreateInitiativeModalOpen(false);
    setIsLoginModalOpen(false); // Ensure login modal also closes on navigation
    window.scrollTo(0, 0); 
  }, [selectedForumCategory]);

  const handleShowInitiativeDetails = useCallback((initiative: Initiative) => {
    handleNavigate(Page.INITIATIVE_DETAILS, initiative);
  }, [handleNavigate]);

  const handleBackToPreviousPage = useCallback(() => {
    if (selectedInitiative) {
        handleNavigate(Page.INITIATIVES);
    } else {
        handleNavigate(Page.MAP);
    }
  }, [handleNavigate, selectedInitiative]);
  
  const handleMapFilterChange = useCallback((filter: InitiativeCategory | 'all') => {
    setMapFilter(filter);
  }, []);

  const toggleForumPreview = useCallback(() => {
    setIsForumPreviewOpen(prev => !prev);
  }, []);

  const handleSelectForumCategory = useCallback((category: ForumItemData) => {
    setSelectedForumCategory(category);
    setCurrentPage(Page.FORUM); 
    window.scrollTo(0,0);
  }, []);

  const handleBackToForumMain = useCallback(() => {
    setSelectedForumCategory(null);
    setCurrentPage(Page.FORUM);
    window.scrollTo(0,0);
  }, []);

  // Create Topic Modal Handlers
  const handleOpenCreateTopicModal = useCallback(() => {
    setIsCreateTopicModalOpen(true);
  }, []);

  const handleCloseCreateTopicModal = useCallback(() => {
    setIsCreateTopicModalOpen(false);
  }, []);

  const handleCreateTopic = useCallback((newTopicData: { title: string; categoryId: string; tags: string; message: string }) => {
    const newTopic: ForumTopic = {
      id: `topic_${Date.now()}`,
      categoryId: newTopicData.categoryId,
      title: newTopicData.title,
      author: 'Usuário Atual', 
      lastReplyTime: 'agora mesmo',
      tags: newTopicData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      replyCount: 0,
    };
    setAllForumTopics(prevTopics => [newTopic, ...prevTopics]);
    handleCloseCreateTopicModal();
    const category = FORUM_POPUP_DATA.find(cat => cat.id === newTopicData.categoryId);
    if (category) {
      handleSelectForumCategory(category);
    }
  }, [handleCloseCreateTopicModal, handleSelectForumCategory]);

  // Create Initiative Modal Handlers
  const handleOpenCreateInitiativeModal = useCallback(() => {
    setIsCreateInitiativeModalOpen(true);
  }, []);

  const handleCloseCreateInitiativeModal = useCallback(() => {
    setIsCreateInitiativeModalOpen(false);
  }, []);

  const handleCreateInitiative = useCallback((formData: CreateInitiativeFormData) => {
    const newId = allInitiatives.length > 0 ? Math.max(...allInitiatives.map(i => i.id)) + 1 : 1;
    const newInitiative: Initiative = {
      id: newId,
      name: formData.name,
      type: formData.type,
      lat: parseFloat(formData.lat) || 0,
      lng: parseFloat(formData.lng) || 0,
      avatar: formData.avatar || `https://picsum.photos/seed/Avatar${newId}/160/160`,
      banner: formData.banner || `https://picsum.photos/seed/Banner${newId}/1200/250`,
      tags: formData.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag),
      details: {
        Responsavel: formData.responsavel,
        Local: formData.local,
        Descrição: formData.descricao,
        departamento: formData.departamento,
      },
      campo: formData.campo,
      countryCode: formData.countryCode,
      projects: [], 
    };
    setAllInitiatives(prevInitiatives => [newInitiative, ...prevInitiatives]);
    handleCloseCreateInitiativeModal();
    if (currentPage !== Page.INITIATIVES) {
      handleNavigate(Page.INITIATIVES);
    }
  }, [allInitiatives, handleCloseCreateInitiativeModal, currentPage, handleNavigate]);

  // Login Modal Handlers
  const handleOpenLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleLoginSubmit = useCallback((data: { email: string; pass: string }) => {
    console.log('Login attempt:', data);
    alert(`Tentativa de Login:\nEmail: ${data.email}\nSenha: ${data.pass}\n\n(Funcionalidade de login real não implementada.)`);
    handleCloseLoginModal(); // Close modal after "login"
  }, [handleCloseLoginModal]);


  const renderPage = () => {
    switch (currentPage) {
      case Page.MAP:
        return (
          <MapPage 
            initiatives={allInitiatives}
            onShowInitiativeDetails={handleShowInitiativeDetails}
            onNavigate={handleNavigate}
            isForumPreviewOpen={isForumPreviewOpen}
            onToggleForumPreview={toggleForumPreview}
          />
        );
      case Page.FORUM:
        if (selectedForumCategory) {
          const topicsForCategory = allForumTopics.filter(topic => topic.categoryId === selectedForumCategory.id);
          const categoryData = FORUM_POPUP_DATA.find(cat => cat.id === selectedForumCategory.id) || selectedForumCategory;
          return (
            <ForumCategoryViewPage 
              categoryData={categoryData}
              topics={topicsForCategory}
              availableTags={FORUM_CATEGORY_VIEW_SIDEBAR_TAGS}
              onBack={handleBackToForumMain}
              onOpenCreateTopicModal={handleOpenCreateTopicModal}
            />
          );
        }
        return <ForumPage onSelectCategory={handleSelectForumCategory} />;
      case Page.INITIATIVES:
        return (
          <InitiativesPage 
            initiatives={allInitiatives}
            onShowInitiativeDetails={handleShowInitiativeDetails} 
            onOpenCreateInitiativeModal={handleOpenCreateInitiativeModal}
          />
        );
      case Page.INITIATIVE_DETAILS:
        return <InitiativeDetailsPage initiative={selectedInitiative} onBack={handleBackToPreviousPage} />;
      // No Page.LOGIN case, LoginPage is rendered as a modal
      default: 
        return (
            <MapPage 
              initiatives={allInitiatives}
              onShowInitiativeDetails={handleShowInitiativeDetails}
              onNavigate={handleNavigate}
              isForumPreviewOpen={isForumPreviewOpen}
              onToggleForumPreview={toggleForumPreview}
            />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-positive-bg-base font-inter antialiased">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        showMapFilters={currentPage === Page.MAP}
        onOpenLoginModal={handleOpenLoginModal} // Pass modal open handler
      >
        {currentPage === Page.MAP && (
          <FilterButtons currentFilter={mapFilter} onFilterChange={handleMapFilterChange} />
        )}
      </Header>
      <main className="flex-grow flex flex-col relative">
        {renderPage()}
      </main>
      {isCreateTopicModalOpen && (
        <CreateTopicModal
          isOpen={isCreateTopicModalOpen}
          onClose={handleCloseCreateTopicModal}
          onCreateTopic={handleCreateTopic}
          forumCategories={FORUM_POPUP_DATA}
          defaultCategoryId={selectedForumCategory?.id}
        />
      )}
      {isCreateInitiativeModalOpen && (
        <CreateInitiativeModal
          isOpen={isCreateInitiativeModalOpen}
          onClose={handleCloseCreateInitiativeModal}
          onCreateInitiative={handleCreateInitiative}
        />
      )}
      {isLoginModalOpen && ( // Conditionally render LoginPage as a modal
        <LoginPage
          isOpen={isLoginModalOpen}
          onClose={handleCloseLoginModal}
          onLoginSubmit={handleLoginSubmit}
        />
      )}
    </div>
  );
};

export default App;
