import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const FamilyTree = () => {
  const [data, setData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [rootOptions, setRootOptions] = useState([]);
  const [selectedRoot, setSelectedRoot] = useState(null);
  const svgRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setData(jsonData);
        setRootOptions([jsonData, ...jsonData.children]);
        setSelectedRoot(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleRootChange = (event) => {
    const selectedName = event.target.value;
    const rootNode = rootOptions.find(option => option.name === selectedName);
    setSelectedRoot(rootNode);
  };

  useEffect(() => {
    if (selectedRoot) drawTree(selectedRoot);
  }, [selectedRoot]);

  const drawTree = (rootData) => {
    const width = 1200;
    const height = 800;
    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const treeLayout = d3.tree().size([width - 200, height - 200]);
    const root = d3.hierarchy(rootData);
    treeLayout(root);

    svg.selectAll('.link')
      .data(root.links())
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x + 100)
      .attr('y1', d => d.source.y + 100)
      .attr('x2', d => d.target.x + 100)
      .attr('y2', d => d.target.y + 100);

    const nodes = svg.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x + 100},${d.y + 100})`)
      .on('click', (event, d) => setSelectedMember(d.data));

    nodes.append('image')
      .attr('xlink:href', d => d.data.image || '/images/default.jpg')
      .attr('x', -30)
      .attr('y', -30)
      .attr('width', 60)
      .attr('height', 60)
      .attr('clip-path', 'url(#clip)');

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 30);

    const details = nodes.append('g')
      .attr('class', 'details')
      .attr('transform', 'translate(80, 0)');

    details.append('text')
      .attr('dy', 0)
      .text(d => `${d.data.name}`)
      .style('font-size', '12px')
      .style('fill', '#000');

    details.append('text')
      .attr('dy', 15)
      .text(d => d.data.relationship && d.depth !== 0 ? `Relation: ${d.data.relationship}` : '')
      .style('font-size', '10px')
      .style('fill', 'gray');

    details.append('text')
      .attr('dy', 30)
      .text(d => d.data.age ? `Age: ${d.data.age}` : '')
      .style('font-size', '10px')
      .style('fill', 'gray');
  };

  return (
    <div>
      <button className='btn btn-success' onClick={triggerFileInput}>Upload</button>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      {rootOptions.length > 0 && (
        <select className='dropdown' onChange={handleRootChange} value={selectedRoot?.name || ''}>
          {rootOptions.map((option, index) => (
            <option key={index} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      )}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default FamilyTree;
