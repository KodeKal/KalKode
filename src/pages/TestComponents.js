// src/pages/TestComponents.js

import React, { useState } from 'react';
import EditableText from './shop/components/EditableComponents/EditableText';
import EditableImage from './shop/components/EditableComponents/EditableImage';
import EditableItem from './shop/components/EditableComponents/EditableItem';

const TestComponents = () => {
  const [testText, setTestText] = useState('Test Text');
  const [testImage, setTestImage] = useState(null);
  const [testItem, setTestItem] = useState({
    name: 'Test Item',
    price: '99.99',
    description: 'Test Description',
    image: null,
    tags: ['test']
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Test EditableText</h2>
      <EditableText 
        value={testText}
        onChange={setTestText}
      />

      <h2>Test EditableImage</h2>
      <EditableImage
        value={testImage}
        onChange={setTestImage}
      />

      <h2>Test EditableItem</h2>
      <EditableItem
        item={testItem}
        onChange={setTestItem}
        onDelete={() => console.log('Delete clicked')}
      />
    </div>
  );
};

export default TestComponents;