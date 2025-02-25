// src/components/common/Pagination.js
import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Navigation, X } from 'lucide-react';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
`;

const PageButton = styled.button`
  background: ${props => props.active ? 'rgba(128, 0, 0, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.active ? '#800000' : 'rgba(128, 0, 0, 0.3)'};
  color: ${props => props.active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: rgba(128, 0, 0, 0.2);
    border-color: #800000;
    color: #FFFFFF;
  }
`;

const PageInfo = styled.span`
  color: rgba(255, 255, 255, 0.8);
  margin: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LocationFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
  padding-right: 1rem;
  border-right: 1px solid rgba(128, 0, 0, 0.3);
`;

const LocationBadge = styled.div`
  background: rgba(128, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }
`;

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage,
  currentLocation,  // New prop for location filter
  onClearLocation   // New prop for clearing location filter
}) => {
  const showingFrom = (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <PaginationContainer>
      {currentLocation && (
        <LocationFilter>
          <LocationBadge>
            <Navigation size={14} />
            ZIP: {currentLocation}
            {onClearLocation && (
              <button onClick={onClearLocation} title="Clear location filter">
                <X size={14} />
              </button>
            )}
          </LocationBadge>
        </LocationFilter>
      )}

      <PageButton 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </PageButton>

      <PageInfo>
        Showing {showingFrom}-{showingTo} of {totalItems} items
        {currentLocation && ' in this area'}
      </PageInfo>

      <PageButton 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </PageButton>
    </PaginationContainer>
  );
};

export default Pagination;