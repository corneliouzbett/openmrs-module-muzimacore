package org.openmrs.module.muzima.api.service;

import org.openmrs.api.OpenmrsService;
import org.openmrs.module.muzima.model.MuzimaCohortMetadata;

import java.util.List;

public interface MuzimaCohortMetadataService extends OpenmrsService {
    List<MuzimaCohortMetadata> saveMuzimaCohortMetadata(final List<MuzimaCohortMetadata> muzimaCohortMetadata);

    void deleteMuzimaCohortMetadata(final List<MuzimaCohortMetadata> muzimaCohortMetadata);
}
